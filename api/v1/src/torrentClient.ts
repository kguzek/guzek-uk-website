import axios, { AxiosError } from "axios";
import { getLogger } from "./middleware/logging";
import { TorrentInfo } from "./models";
import { convertTorrentInfo } from "./util";

const API_URL = "https://transmission.guzek.uk/transmission/rpc";
const SESSION_ID_HEADER_NAME = "X-Transmission-Session-Id";
const SESSION_ID_PATTERN = /<code>X-Transmission-Session-Id: (.+)<\/code>/;
// ETA: Estimated download duration in seconds (/60 for minutes)
// leftUntilDone: Estimated download duration in microseconds (/1000 /1000 /60 for minutes)
const FIELDS = [
  "id",
  "name",
  "status",
  "rateDownload",
  "percentDone",
  "leftUntilDone",
  "eta",
];
/** The free space required for new torrents to be downloaded. Default: 100 MiB. */
const MIN_REQUIRED_KEBIBYTES = 102400;
const DOWNLOAD_PATH = "/var/lib/transmission-daemon/downloads";

const logger = getLogger(__filename);

export const TORRENT_STATUSES = [
  "Stopped",
  "Unknown status 1",
  "Unknown status 2",
  "Unknown status 3",
  "Downloading",
  "Unknown status 5",
  "Idle/Seeding",
];

type Method =
  | "session-get"
  | "session-stats"
  | "torrent-get"
  | "free-space"
  | "torrent-add";

type TorrentResponse<T extends Method> = T extends "session-get"
  ? string
  : T extends "torrent-get"
  ? { arguments: { torrents: TorrentInfo[] } }
  : T extends "free-space"
  ? { arguments: { "size-bytes": number } }
  : T extends "torrent-add"
  ? { arguments: { "torrent-added"?: TorrentInfo } }
  : { arguments: Record<string, any> };

type ExemptMethod = "session-get" | "session-stats";

export class TorrentClient {
  auth?: { username: string; password: string };
  sessionId?: string;
  numTorrents: number = 0;
  private initPromise: Promise<void> | null = null;

  constructor() {
    const auth = process.env.TR_AUTH;

    if (!auth) {
      logger.error("No TR_AUTH variable set.");
      return;
    }
    const [username, password] = auth.split(":");
    this.auth = { username, password };
    this.initPromise = this.init();
  }

  private updateSessionId(resData: string) {
    this.sessionId = resData.match(SESSION_ID_PATTERN)?.[1];
  }

  private async init() {
    const resSessionId = await this.fetch("session-get");
    this.updateSessionId(resSessionId);
    if (this.sessionId == null) {
      logger.error("Could not establish the session id.");
      return;
    }
    const resSessionStats = await this.fetch("session-stats");
    this.numTorrents = resSessionStats.arguments.torrentCount;
  }

  private async fetch<T extends Method>(
    method: T,
    ...[args]: T extends ExemptMethod
      ? []
      : [args: Record<string, any>]
  ): Promise<TorrentResponse<T>> {
    if (this.initPromise != null && !method.startsWith("session")) {
      // Wait until the client has completed initialisation
      await this.initPromise;
      this.initPromise = null;
    }

    let res;
    try {
      res = await axios({
        url: API_URL,
        method: "POST",
        auth: this.auth,
        data: {
          method,
          arguments: args,
        },
        headers: { [SESSION_ID_HEADER_NAME]: this.sessionId ?? "" },
      });
    } catch (error) {
      res = (error as AxiosError).response;
      if (!res) {
        console.error("Could not obtain a response from the torrent client.");
        throw error;
      }
      if (method !== "session-get") {
        if (res.status === 409) {
          this.updateSessionId(res.data as string);
          const passed = [args] as T extends ExemptMethod ? [] : [args: Record<string, any>];
          logger.warn("Recursing due to 409 client response");
          return await this.fetch(method, ...passed);
        }
        logger.error(`Client response: ${res.status} ${res.statusText}`);
      }
    }
    return res.data as TorrentResponse<T>;
  }

  async getTorrentInfo() {
    const response = await this.fetch("torrent-get", { fields: FIELDS });
    if (!response.arguments) {
      logger.error("Invalid response " + JSON.stringify(response));
      return [];
    }
    return response.arguments.torrents.reduce((mapped, current) => {
      try {
        mapped.push(convertTorrentInfo(current));
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("doesn't match regex"))
          throw error;
      }
      return mapped;
    }, [] as ReturnType<typeof convertTorrentInfo>[]);
  }

  async addTorrent(link: string, createDatabaseEntry?: () => Promise<any>) {
    const resFreeSpace = await this.fetch("free-space", {
      path: DOWNLOAD_PATH,
    });
    const freeBytes = resFreeSpace.arguments["size-bytes"];
    if (!freeBytes) return null;
    const freeKebiBytes = Math.floor(freeBytes / 1024);
    if (freeKebiBytes < MIN_REQUIRED_KEBIBYTES) {
      logger.error(
        `Not enough free space to download torrent. Free space: ${freeKebiBytes} KiB`
      );
      return null;
    }

    const resTorrentAdd = await this.fetch("torrent-add", {
      filename: link,
      "download-dir": DOWNLOAD_PATH,
      paused: false,
    });
    const torrent = resTorrentAdd.arguments["torrent-added"];
    if (!torrent) {
      logger.info("Duplicate file; no torrents added. Creating database entry.");
      if (createDatabaseEntry) await createDatabaseEntry();
      return null;
    }
    this.numTorrents++;
    return convertTorrentInfo(torrent);
  }
}


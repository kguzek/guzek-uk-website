import axios, { AxiosError } from "axios";
import { getLogger } from "./middleware/logging";

const API_URL = "https://transmission.guzek.uk/transmission/rpc";
const SESSION_ID_HEADER_NAME = "X-Transmission-Session-Id";
const SESSION_ID_PATTERN = /<code>X-Transmission-Session-Id: (.+)<\/code>/;
// ETA: Estimated download duration in seconds (/60 for minutes)
// leftUntilDone: Estimated download duration in microseconds (/1000 /1000 /60 for minutes)
const FIELDS = [
  "id",
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
  ? { arguments: { torrents: Torrent[] } }
  : T extends "free-space"
  ? { arguments: { "size-bytes": number } }
  : T extends "torrent-add"
  ? { arguments: { "torrent-added"?: Torrent } }
  : { arguments: Record<string, any> };

interface Torrent {
  id: number;
  rateDownload?: number;
  eta?: number;
  percentDone: number;
}

export class TorrentClient {
  auth?: { username: string; password: string };
  sessionId?: string;
  numTorrents: number = 0;

  constructor() {
    const auth = process.env.TR_AUTH;

    if (!auth) {
      logger.error("No TR_AUTH variable set.");
      return;
    }
    const [username, password] = auth.split(":");
    this.auth = { username, password };
    this.init();
  }

  private async init() {
    const resSessionId = await this.fetch("session-get");
    this.sessionId = resSessionId.match(SESSION_ID_PATTERN)?.[1];
    if (this.sessionId == null) {
      logger.error("Could not establish the session id.");
      return;
    }
    const resSessionStats = await this.fetch("session-stats");
    this.numTorrents = resSessionStats.arguments.torrentCount;
  }

  private async fetch<T extends Method>(
    method: T,
    ...[args]: T extends "session-get" | "session-stats"
      ? []
      : [args: Record<string, any>]
  ): Promise<TorrentResponse<T>> {
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
        headers: { [SESSION_ID_HEADER_NAME]: this.sessionId },
      });
    } catch (error) {
      res = (error as AxiosError).response;
      if (!res) {
        throw new Error("Could not obtain a response from the torrent client.");
      }
      if (method !== "session-get")
        logger.error(`Client response: ${res.status} ${res.statusText}`);
    }
    return res.data;
  }

  async getTorrentInfo(id?: number) {
    const response = await this.fetch("torrent-get", { fields: FIELDS });
    const torrents = response.arguments.torrents;
    if (!id) return torrents;
    return torrents.find((torrent) => torrent.id === id);
  }

  async addTorrent(link: string) {
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
    if (!torrent) return null;
    this.numTorrents++;
    return torrent;
  }
}

// async function main() {
//   await init();
//   for (const torrent of await getTorrentInfo()) {
//     logger.log(
//       `Torrent id ${torrent.id}, status ${TORRENT_STATUSES[torrent.status]}`
//     );
//     const pending = torrent.leftUntilDone;
//     const rate = (torrent.rateDownload / 1024 / 1024).toFixed(2);
//     const msg = pending ? ` @ ${rate} MiB/s` : "";
//     const done = Math.floor(torrent.percentDone * 100);
//     logger.log(`Download progress: ${done}%${msg}`);
//     const eta = Math.ceil(torrent.eta / 60);
//     torrent.leftUntilDone && logger.log(`${eta} min remaining`);
//     logger.log();
//   }
// }

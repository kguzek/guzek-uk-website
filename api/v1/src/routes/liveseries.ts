import express, { Request, Response } from "express";
import expressWs from "express-ws";
import { ObjectEncodingOptions, promises as fs } from "fs";
import { CronJob } from "cron";
import { getLogger } from "../middleware/logging";
import {
  UserShows,
  User,
  WatchedEpisodes,
  DownloadedEpisode,
  sanitiseShowName,
} from "../sequelize";
import axios from "axios";
import {
  createDatabaseEntry,
  deleteDatabaseEntry,
  readAllDatabaseEntries,
  readDatabaseEntry,
  sendError,
  sendOK,
  updateDatabaseEntry,
  updateEndpoint,
  validateNaturalNumber,
  validateNaturalList,
  sendFileStream,
  serialiseEpisode,
  getStatusText,
  logResponse,
  setCacheControl,
} from "../util";
import {
  WatchedShowData,
  Episode,
  TvShow,
  TORRENT_DOWNLOAD_PATH,
  DownloadStatus,
  TorrentInfo,
  BasicEpisode,
  STATIC_CACHE_DURATION_MINS,
  CustomRequest,
} from "../models";
import { TorrentClient, ConvertedTorrentInfo } from "../torrentClient";
import {
  downloadSubtitles,
  getSubtitleClient,
  SUBTITLES_DEFAULT_LANGUAGE,
} from "../subtitles";
import { TorrentIndexer } from "../torrentIndexers/torrentIndexer";
import { Eztv } from "../torrentIndexers/eztv";

export const router = express.Router() as expressWs.Router;

const WS_MESSAGE_INTERVAL_MS = 3000;
const SUBTITLES_PATH = "/var/cache/guzek-uk/subtitles";
const SUBTITLES_FILENAME = "subtitles.vtt";
/** If set to `true`, doesn't use locally downloaded subtitles file. */
const SUBTITLES_FORCE_DOWNLOAD_NEW = false;

const EPISODATE_API_BASE = "https://episodate.com/api/show-details?q=";

// For some reason TypeScript doesn't recognise the `recursive` option provided in the fs docs
const RECURSIVE_READ_OPTIONS = {
  encoding: "utf-8",
  recursive: true,
} as ObjectEncodingOptions;

const logger = getLogger(__filename);
let torrentClient: TorrentClient;
const torrentIndexer: TorrentIndexer = new Eztv();

let lastMessageTimestamp = 0;
const currentTimeouts: Record<number, () => Promise<void>> = {};

const hasEpisodeAired = (episode: Episode) =>
  new Date() > new Date(episode.air_date + " Z");

async function tryDownloadEpisode(tvShow: TvShow, episode: Episode) {
  const result = await DownloadedEpisode.findOne({
    where: {
      showId: tvShow.id,
      episode: episode.episode,
      season: episode.season,
    },
  });
  logger.debug("Result is: " + result);
  return result ? null : await downloadEpisode(tvShow, episode);
}

async function downloadEpisode(tvShow: TvShow, episode: Episode) {
  const result = await torrentIndexer.findTopResult({
    ...episode,
    showName: tvShow.name,
  });
  if (!result || !result.link) {
    logger.error(
      "Search query turned up empty. Either no torrents available, or indexer is outdated."
    );
    return null;
  }

  const createEntry = () =>
    DownloadedEpisode.create({
      showId: tvShow.id,
      showName: tvShow.name,
      episode: episode.episode,
      season: episode.season,
    });
  let torrentInfo;
  try {
    torrentInfo = await torrentClient.addTorrent(result.link, createEntry);
  } catch {
    logger.error("The torrent client is unavailable");
    return null;
  }
  if (!torrentInfo) {
    logger.error(`Adding the torrent to the client failed.`);
    return null;
  }
  await createEntry();
  await updateEndpoint(DownloadedEpisode);
  logger.info(`Successfully added new torrent.`);
  sendWebsocketMessage();
  return torrentInfo;
}

async function checkUnwatchedEpisodes() {
  const users = await User.findAll({ where: { admin: true } });
  for (const user of users) {
    const username = user.get("username") as string;
    logger.info(`Checking ${username}'s unwatched episodes`);
    const uuid = user.get("uuid") as string;
    const watchedEpisodes = await WatchedEpisodes.findByPk(uuid);
    if (!watchedEpisodes) continue;
    const watchedShowData = watchedEpisodes.get(
      "watchedEpisodes"
    ) as WatchedShowData;
    const { subscribedShows } = await getUserShows(uuid);
    if (!subscribedShows) continue;
    for (const showId of subscribedShows) {
      const watchedData = watchedShowData[showId];
      axios.get(EPISODATE_API_BASE + showId).then(
        (res) => {
          const tvShow = res.data.tvShow as TvShow;
          for (const episode of tvShow.episodes) {
            if (!hasEpisodeAired(episode)) continue;
            if (watchedData?.[episode.season]?.includes(episode.episode))
              continue;
            tryDownloadEpisode(tvShow, episode);
          }
        },
        (error) =>
          logger.error(
            `Could not retrieve liked show ${showId} details. ${error}`
          )
      );
    }
  }
}

export function init() {
  getSubtitleClient();
  torrentClient = new TorrentClient();
  if (!torrentClient) {
    logger.error("Failed to initialise the torrent client. Aborting cron job.");
    return;
  }
  checkUnwatchedEpisodes();

  new CronJob(
    "0 0 */6 * * *",
    checkUnwatchedEpisodes,
    null,
    true,
    "Europe/Warsaw"
  );
}

/**
 * Obtains the requesting user's liked and subscribed shows from the database.
 * `likedShows` and `subscribedShows` are returned as arrays of show IDs.
 * If the user has no entries in the database, these values are `undefined`.
 */
async function getUserShows(userUuid?: string) {
  const entry = userUuid ? await UserShows.findByPk(userUuid) : null;
  return {
    likedShows: entry?.get("likedShows") as undefined | number[],
    subscribedShows: entry?.get("subscribedShows") as undefined | number[],
  };
}

async function modifyUserShows(
  req: CustomRequest,
  res: Response,
  add: boolean,
  liked: boolean
) {
  const showId = +req.params.showId;
  const errorMessage = validateNaturalNumber(showId);
  if (errorMessage) return sendError(res, 400, { message: errorMessage });
  const userUUID = req.user?.uuid;
  const { likedShows, subscribedShows } = await getUserShows(userUUID);
  if (likedShows == null || subscribedShows == null) {
    const success = await createDatabaseEntry(
      UserShows,
      req,
      res,
      { userUUID, likedShows: [], subscribedShows: [] },
      () => {}
    );
    if (!success) return;
  }
  const collection = (liked ? likedShows : subscribedShows) ?? [];
  // Trying to add if already present, or trying to remove if not present
  if (add === collection.includes(showId)) {
    return sendError(res, 409, {
      message: `Show with id '${showId}' is ${add ? "already" : "not"} ${
        liked ? "liked" : "subscribed"
      }.`,
    });
  }
  const key = liked ? "likedShows" : "subscribedShows";
  await updateDatabaseEntry(
    UserShows,
    req,
    res,
    {
      [key]: add
        ? [...collection, showId]
        : collection.filter((id) => id !== showId),
    },
    { userUUID: req.user?.uuid }
  );
}

function sendWebsocketMessage() {
  logger.debug("Speeding up websocket message");
  lastMessageTimestamp = 0;
  for (const [timeout, callback] of Object.entries(currentTimeouts)) {
    clearTimeout(+timeout);
    callback();
  }
}

// GET all users' liked & subscribed TV shows
router.get("/shows", (_req, res) => readAllDatabaseEntries(UserShows, res));

// GET own liked & subscribed TV shows
router.get("/shows/personal", async (req: CustomRequest, res) => {
  const uuid = req.user?.uuid;
  const { likedShows, subscribedShows } = await getUserShows(uuid);
  sendOK(res, {
    likedShows: likedShows ?? [],
    subscribedShows: subscribedShows ?? [],
  });
});

// GET all users' watched episodes
router.get("/watched-episodes", (_req, res) =>
  readAllDatabaseEntries(WatchedEpisodes, res)
);

// GET own watched episodes
router.get("/watched-episodes/personal", async (req: CustomRequest, res) => {
  const watchedEpisodes = await readDatabaseEntry(
    WatchedEpisodes,
    res,
    { userUUID: req.user?.uuid },
    undefined,
    true
  );
  if (!watchedEpisodes) return;
  const watchedData =
    (watchedEpisodes[0]?.get("watchedEpisodes") as WatchedShowData) ?? {};
  sendOK(res, watchedData);
});

// GET all downloaded episodes
router.ws("/downloaded-episodes/ws", (ws, req) => {
  if (!torrentClient) {
    logger.error(
      "Websocket connection established without active torrent client."
    );
    return;
  }

  lastMessageTimestamp = 0;

  ws.on("message", (msg) => {
    let evt: { type: string; data: any };

    try {
      evt = JSON.parse(msg.toString());
    } catch (error) {
      logger.error(`Could not parse websocket message '${msg}'. ${error}`);
      return;
    }

    /** The callback to call after a message event which should resolve to the data to be sent back. */
    let action: (data: any) => Promise<any>;

    let delayMultiplier = 1;

    switch (evt.type) {
      case "poll":
        action = () => torrentClient.getAllTorrentInfos();
        const torrents = evt.data as ConvertedTorrentInfo[];
        // Enable longer response times if all downloads are complete
        if (torrents && Array.isArray(torrents)) {
          if (
            !torrents.find(
              (torrent) => torrent.status !== DownloadStatus.COMPLETE
            )
          )
            delayMultiplier = 20;
        } else {
          logger.warn(
            `Received invalid data argument for poll message: '${torrents}'.`
          );
          delayMultiplier = 5;
        }
        break;
      default:
        logger.warn(
          `Unknown message type '${evt.type}' received in websocket connection.`
        );
        return;
    }

    const currentTimestamp = new Date().getTime();
    const ping = Math.max(0, currentTimestamp - lastMessageTimestamp);
    const delayMs = Math.max(
      0,
      WS_MESSAGE_INTERVAL_MS * delayMultiplier - ping
    );
    lastMessageTimestamp = currentTimestamp + delayMs;
    //logger.debug(`Sending message in ${delayMs / 1000} s`);
    const currentTimeout = +global.setTimeout(nextMessageCallback, delayMs);
    currentTimeouts[currentTimeout] = nextMessageCallback;

    async function nextMessageCallback() {
      delete currentTimeouts[currentTimeout];

      let data = [];
      try {
        data = await action(evt.data);
      } catch (error) {
        logger.error(error);
      }
      const message = JSON.stringify({ data });
      ws.send(message);
    }
  });
});

// START downloading episode
router.post("/downloaded-episodes", async (req, res) => {
  const tvShow: TvShow = req.body.tvShow;
  const episode: Episode = req.body.episode;

  const errorMessage =
    validateNaturalNumber(tvShow?.id) ??
    validateNaturalNumber(episode.season) ??
    validateNaturalNumber(episode.episode) ??
    tvShow.name
      ? null
      : "Request body `tvShow` object is missing property `name`.";

  if (errorMessage) return sendError(res, 400, { message: errorMessage });

  const downloadedEpisode = await tryDownloadEpisode(tvShow, episode);
  if (downloadedEpisode) return sendOK(res, downloadedEpisode);
  sendError(res, 400, {
    message: `Invalid TV show '${tvShow.name}' or episode '${serialiseEpisode(
      episode
    )}', or it is already downloaded.`,
  });
});

// ADD liked TV show
router.post("/shows/personal/liked/:showId", (req, res) =>
  modifyUserShows(req, res, true, true)
);

// DELETE liked TV show
router.delete("/shows/personal/liked/:showId", (req, res) =>
  modifyUserShows(req, res, false, true)
);

// ADD subscribed TV show
router.post("/shows/personal/subscribed/:showId", (req, res) =>
  modifyUserShows(req, res, true, false)
);

// DELETE subscribed TV show
router.delete("/shows/personal/subscribed/:showId", (req, res) =>
  modifyUserShows(req, res, false, false)
);

// UPDATE own watched episodes
router.put(
  "/watched-episodes/personal/:showId/:season",
  async (req: CustomRequest, res) => {
    const showId = +req.params.showId;
    const season = +req.params.season;
    const errorMessage =
      validateNaturalNumber(showId) ?? validateNaturalNumber(season);
    if (errorMessage) return sendError(res, 400, { message: errorMessage });
    if (!validateNaturalList(req.body, res)) return;
    const where = { userUUID: req.user?.uuid };
    const storedModel = await readDatabaseEntry(
      WatchedEpisodes,
      res,
      where,
      undefined,
      true
    );
    if (!storedModel) return;
    if (storedModel.length === 0) {
      await createDatabaseEntry(WatchedEpisodes, req, res, {
        ...where,
        watchedEpisodes: { [showId]: { [season]: req.body } },
      });
      return;
    }
    const storedData = storedModel[0].get("watchedEpisodes") as WatchedShowData;
    const watchedEpisodes = {
      ...storedData,
      [showId]: { ...storedData[showId], [season]: req.body },
    };
    updateDatabaseEntry(WatchedEpisodes, req, res, { watchedEpisodes }, where);
  }
);

/**
 * Parses the requested torrent from the request object and either calls the callback with
 * information related to the torrent, or sends an error response if the torrent is not found.
 */
async function handleTorrentRequest(
  req: Request,
  res: Response,
  callback: (
    torrent: TorrentInfo,
    episode: BasicEpisode
  ) => void | Promise<void>,
  torrentNotFoundCallback?: (episode: BasicEpisode) => void | Promise<void>
) {
  const showName = req.params.showName;
  const season = +req.params.season;
  const episode = +req.params.episode;
  const basicEpisode: BasicEpisode = { showName, season, episode };
  const errorMessage =
    validateNaturalNumber(season) ?? validateNaturalNumber(episode);
  if (errorMessage) return sendError(res, 400, { message: errorMessage });
  let torrent: TorrentInfo | undefined;
  try {
    torrent = await torrentClient.getTorrentInfo(basicEpisode);
  } catch (error) {
    logger.error(error);
    return sendError(res, 500, {
      message: "Could not obtain the current torrent list. Try again later.",
    });
  }
  if (!torrent) {
    const serialised = serialiseEpisode({ season, episode });
    if (torrentNotFoundCallback) {
      try {
        const promise = torrentNotFoundCallback(basicEpisode);
        if (promise) await promise;
        return;
      } catch (error) {
        if (
          !(error instanceof Error) ||
          error.message !== "Backup episode search failed"
        )
          logger.error(error);
        // Continue to the 404 response
      }
    }
    return sendError(res, 404, {
      message: `Episode '${showName} ${serialised}' was not found in the downloads.`,
    });
  }
  const sanitised = sanitiseShowName(showName);
  callback(torrent, { showName: sanitised, season, episode });
}

const parseFilename = (filename: string) =>
  sanitiseShowName(filename).toLowerCase();

/**
 * Searches the downloads folder for a filename which matches the episode.
 * Sends a 500 response if the folder could not be read.
 * Throws an `Error` if the episode is not found, which must be handled.
 */
async function searchForDownloadedEpisode(
  res: Response,
  episode: BasicEpisode
) {
  const search = `${sanitiseShowName(episode.showName)} ${serialiseEpisode(
    episode
  )}`;
  const searchLowerCase = search.toLowerCase();

  let files;
  try {
    files = await fs.readdir(TORRENT_DOWNLOAD_PATH, RECURSIVE_READ_OPTIONS);
  } catch (e) {
    logger.error(e);
    return sendError(res, 500, {
      message: "Could not load the downloaded episodes.",
    });
  }
  const match = files.find(
    (file) =>
      parseFilename(file).startsWith(searchLowerCase) && file.endsWith(".mp4")
  );
  if (match) return TORRENT_DOWNLOAD_PATH + match;
  throw new Error("Backup episode search failed");
}

router.get("/video/:showName/:season/:episode", (req, res) =>
  handleTorrentRequest(
    req,
    res,
    (torrent) => sendFileStream(req, res, TORRENT_DOWNLOAD_PATH + torrent.name),

    async (episode) => {
      const filename = await searchForDownloadedEpisode(res, episode);
      if (!filename) return;
      sendFileStream(req, res, filename);
    }
  )
);

router.delete("/video/:showName/:season/:episode", (req, res) =>
  handleTorrentRequest(req, res, async (torrent, episode) => {
    try {
      await deleteDatabaseEntry(DownloadedEpisode, episode);
    } catch (error) {
      logger.error(error);
      return sendError(res, 500, {
        message: "Could not delete the episode from the database.",
      });
    }
    try {
      await torrentClient.removeTorrent(torrent);
    } catch (error) {
      logger.error(error);
      return sendError(res, 500, {
        message: `An unknown error occured while removing the torrent. The database entry was removed.`,
      });
    }
    sendWebsocketMessage();

    try {
      await fs.rm(TORRENT_DOWNLOAD_PATH + torrent.name, { recursive: true });
    } catch (error) {
      logger.error(error);
      return sendError(res, 500, {
        message: `An unknown error occurred while removing the files. The torrent and database entry were removed.`,
      });
    }

    sendOK(res);
  })
);

async function getSubtitles(
  req: Request,
  res: Response,
  episode: BasicEpisode,
  filename: string
) {
  const directory = `${SUBTITLES_PATH}/${episode.showName}/${episode.season}/${episode.episode}`;
  const filepath = `${directory}/${SUBTITLES_FILENAME}`;
  try {
    await fs.access(filepath);
    if (process.env.SUBTITLES_API_KEY_DEV && SUBTITLES_FORCE_DOWNLOAD_NEW) {
      throw new Error("Force fresh download of subtitles");
    }
  } catch (error) {
    const language = `${
      req.query.lang || SUBTITLES_DEFAULT_LANGUAGE
    }`.toLowerCase();
    const errorMessage = await downloadSubtitles(
      directory,
      filepath,
      filename,
      episode,
      language
    );
    if (errorMessage) {
      sendError(res, 400, { message: errorMessage });
      return;
    }
  }
  setCacheControl(res, STATIC_CACHE_DURATION_MINS);
  res.status(200).sendFile(filepath);
  logResponse(res, `${getStatusText(200)} (${SUBTITLES_FILENAME})`);
}

router.get("/subtitles/:showName/:season/:episode", (req, res) =>
  handleTorrentRequest(
    req,
    res,
    (torrent, episode) => getSubtitles(req, res, episode, torrent.name),
    async (episode) => {
      const filename = await searchForDownloadedEpisode(res, episode);
      if (!filename) return;
      getSubtitles(
        req,
        res,
        episode,
        filename.replace(TORRENT_DOWNLOAD_PATH, "")
      );
    }
  )
);

import express, { Request, Response } from "express";
import expressWs from "express-ws";
import { createWriteStream, promises as fs } from "fs";
import { CronJob } from "cron";
import { exec } from "child_process";
import { getLogger } from "../middleware/logging";
import { LikedShows, User, WatchedEpisodes, DownloadedEpisode, sanitiseShowName } from "../sequelize";
import axios, { AxiosError, AxiosResponse, AxiosInstance } from "axios";
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
} from "../models";
import { TorrentIndexer } from "../torrentIndexer";
import { TorrentClient, ConvertedTorrentInfo } from "../torrentClient";

export const router = express.Router() as expressWs.Router;

const WS_MESSAGE_INTERVAL_MS = 3000;
const SUBTITLES_PATH = "/var/cache/guzek-uk/subtitles";
const SUBTITLES_FILENAME = "subtitles.vtt";
const SUBTITLES_API_URL = "https://api.opensubtitles.com/api/v1";
const SUBTITLES_DEFAULT_LANGUAGE = "en";
/** If set to `true`, doesn't use locally downloaded subtitles file. */
const SUBTITLES_FORCE_DOWNLOAD_NEW = false;

const EPISODATE_API_BASE = "https://episodate.com/api/show-details?q=";

const logger = getLogger(__filename);
let torrentClient: TorrentClient;
const torrentIndexer = new TorrentIndexer();
let subtitleClient: AxiosInstance | null = null;

let lastMessageTimestamp = 0;
const currentTimeouts: Record<number, () => Promise<void>> = {};


const hasEpisodeAired = (episode: Episode) =>
  new Date() > new Date(episode.air_date + " Z");

async function tryDownloadEpisode(tvShow: TvShow, episode: Episode) {
  const result = await DownloadedEpisode.findOne({ where: {
    showId: tvShow.id,
    episode: episode.episode,
    season: episode.season,
  }});
  return result ? null : await downloadEpisode(tvShow, episode);
}

async function downloadEpisode(tvShow: TvShow, episode: Episode) {
  const episodeSearchQuery = torrentIndexer.getSearchQuery({ ...episode, showName: tvShow.name });
  logger.info(`Found unwatched episode, searching for '${episodeSearchQuery}'.`)
  const result = await torrentIndexer.search(episodeSearchQuery);
  if (!result || !result.link) {
    logger.error("Search query turned up empty. Either no torrents available, or indexer is outdated.");
    return null;
  }

  const createDatabaseEntry = () => DownloadedEpisode.create({
    showId: tvShow.id,
    showName: tvShow.name,
    episode: episode.episode,
    season: episode.season,
  });
  let torrentInfo;
  try {
    torrentInfo = await torrentClient.addTorrent(result.link, createDatabaseEntry);
  } catch {
    logger.error("The torrent client is unavailable");
    return null;
  }
  if (!torrentInfo) {
    logger.error(`Adding the torrent to the client failed.`);
    return null;
  }
  await createDatabaseEntry();
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
    const likedShowsData = await LikedShows.findByPk(uuid);
    if (!likedShowsData) continue;
    const likedShows = likedShowsData.get("likedShows");

    for (const likedShowId of likedShows as number[]) {
      const watchedData = watchedShowData[likedShowId];
      axios.get(EPISODATE_API_BASE + likedShowId).then(
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
            `Could not retrieve liked show ${likedShowId} details. ${error}`
          )
      );
    }
  }
}

async function getSubtitleClient() {
  const headers = {
    "User-Agent": "Guzek UK LiveSeries API v1.0.0",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const apiKeyDev = process.env.SUBTITLES_API_KEY_DEV;
  if (apiKeyDev) {
    subtitleClient = axios.create({
      baseURL: SUBTITLES_API_URL,
      headers: { ...headers, 'Api-Key': apiKeyDev },
    });
    logger.debug("Logged in to OpenSubtitles API as developer");
    return;
  }
  const apiKey = process.env.SUBTITLES_API_KEY;
  const username = process.env.SUBTITLES_API_USER;
  const password = process.env.SUBTITLES_API_PASSWORD;
  if (!apiKey || !username || !password) {
    logger.error("No SUBTITLES_API_KEY, SUBTITLES_API_USER or SUBTITLES_API_PASSWORD environment variable set");
    return;
  }
  let res: AxiosResponse;
  try {
    res = await axios.post(`${SUBTITLES_API_URL}/login`, {
      username,
      password,
    }, { headers });
  } catch (error) {
    logger.error(error);
    (error instanceof AxiosError) && logger.debug(error.response?.data);
    logger.error("Could not reach the OpenSubtitles API");
    return;
  }
  const data = res.data as any;
  if (!data?.base_url || !data.token) {
    logger.error("Invalid OpenSubtitles API response");
    logger.debug(data);
    return;
  }
  subtitleClient = axios.create({
    baseURL: `https://${data.base_url}/api/v1`,
    headers: {
      ...headers,
      "Api-Key": apiKey,
      "Authorization": `Bearer ${data.token}`,
    },
  });
  logger.info("Logged in to OpenSubtitles API");
  logger.debug(data.user);
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

const getLikedShows = (req: Request, res: Response) =>
  readDatabaseEntry(
    LikedShows,
    res,
    { userUUID: req.user.uuid },
    undefined,
    true
  );

async function modifyLikedShows(req: Request, res: Response, add: boolean) {
  const showId = +req.params.showId;
  const errorMessage = validateNaturalNumber(showId);
  if (errorMessage) return sendError(res, 400, { message: errorMessage });
  const likedShows = await getLikedShows(req, res);
  if (!likedShows) return;
  if (likedShows.length === 0) {
    await createDatabaseEntry(LikedShows, req, res, {
      userUUID: req.user.uuid,
      likedShows: add ? [showId] : [],
    });
    return;
  }
  const likedShowsList = getLikedShowsList(likedShows);
  if (add) {
    if (likedShowsList.includes(showId)) {
      return sendError(res, 400, {
        message: `Show with id '${showId}' is already liked.`,
      });
    }
  }
  await updateDatabaseEntry(
    LikedShows,
    req,
    res,
    {
      likedShows: add
        ? [...likedShowsList, showId]
        : likedShowsList.filter((id) => id !== showId),
    },
    { userUUID: req.user.uuid }
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

const getLikedShowsList = (likedShows: LikedShows[]) =>
  (likedShows[0]?.get("likedShows") as number[]) ?? [];

// GET all users' liked TV shows
router.get("/liked-shows", (_req, res) =>
  readAllDatabaseEntries(LikedShows, res)
);

// GET own liked TV shows
router.get("/liked-shows/personal", async (req, res) => {
  const likedShows = await getLikedShows(req, res);
  if (!likedShows) return;
  sendOK(res, getLikedShowsList(likedShows));
});

// GET all users' watched episodes
router.get("/watched-episodes", (_req, res) =>
  readAllDatabaseEntries(WatchedEpisodes, res)
);

// GET own watched episodes
router.get("/watched-episodes/personal", async (req, res) => {
  const watchedEpisodes = await readDatabaseEntry(
    WatchedEpisodes,
    res,
    { userUUID: req.user.uuid },
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
    logger.error("Websocket connection established without active torrent client.");
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
          if (!torrents.find((torrent) => torrent.status !== DownloadStatus.COMPLETE))
            delayMultiplier = 20;
        } else {
          logger.warn(`Received invalid data argument for poll message: '${torrents}'.`);
          delayMultiplier = 5;
        }
        break;
      default:
        logger.warn(`Unknown message type '${evt.type}' received in websocket connection.`);
        return;
    }

    const currentTimestamp = new Date().getTime();
    const ping = Math.max(0, currentTimestamp - lastMessageTimestamp);
    const delayMs = Math.max(0, WS_MESSAGE_INTERVAL_MS * delayMultiplier - ping);
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
    };  
  });
});

// START downloading episode
router.post("/downloaded-episodes", async (req, res) => {
  const tvShow: TvShow = req.body.tvShow;
  const episode: Episode = req.body.episode;
  
  const errorMessage = validateNaturalNumber(tvShow?.id)
    ?? validateNaturalNumber(episode.season)
    ?? validateNaturalNumber(episode.episode)
    ?? tvShow.name ? null : "Request body `tvShow` object is missing property `name`.";

  if (errorMessage)
    return sendError(res, 400, { message: errorMessage });

  const downloadedEpisode = await tryDownloadEpisode(tvShow, episode);
  if (downloadedEpisode) return sendOK(res, downloadedEpisode);
  sendError(res, 400, {
    message: `Invalid TV show '${tvShow.name}' or episode '${serialiseEpisode(episode)}', or it is already downloaded.`
  });
});

// ADD liked TV show
router.post("/liked-shows/personal/:showId", (req, res) =>
  modifyLikedShows(req, res, true)
);

// DELETE liked TV show
router.delete("/liked-shows/personal/:showId", (req, res) =>
  modifyLikedShows(req, res, false)
);

// UPDATE own watched episodes
router.put("/watched-episodes/personal/:showId/:season", async (req, res) => {
  const showId = +req.params.showId;
  const season = +req.params.season;
  const errorMessage =
    validateNaturalNumber(showId) ?? validateNaturalNumber(season);
  if (errorMessage) return sendError(res, 400, { message: errorMessage });
  if (!validateNaturalList(req.body, res)) return;
  const where = { userUUID: req.user.uuid };
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
});

async function handleTorrentRequest(
  req: Request,
  res: Response,
  callback: (torrent: TorrentInfo, episode: BasicEpisode) => void | Promise<void>
) {
  const showName = req.params.showName;
  const season = +req.params.season;
  const episode = +req.params.episode;
  const errorMessage = validateNaturalNumber(season) ?? validateNaturalNumber(episode);
  if (errorMessage) return sendError(res, 400, { message: errorMessage });
  let torrent: TorrentInfo | undefined;
  try {
    torrent = await torrentClient.getTorrentInfo({ showName, season, episode });
  } catch (error) {
    logger.error(error);
    return sendError(res, 500, { message: "Could not obtain the current torrent list. Try again later." });
  }
  if (!torrent) {
    const serialised = serialiseEpisode({ season, episode });
    return sendError(res, 404, {
      message: `Episode '${showName} ${serialised}' was not found in the downloads.`
    });
  }
  const sanitised = sanitiseShowName(showName);
  callback(torrent, { showName: sanitised, season, episode });
}

router.get("/video/:showName/:season/:episode", (req, res) =>
  handleTorrentRequest(req, res, (torrent) => 
    sendFileStream(req, res, TORRENT_DOWNLOAD_PATH + torrent.name)
  )
);

router.delete("/video/:showName/:season/:episode", (req, res) =>
  handleTorrentRequest(req, res, async (torrent, episode) => {
    try {
      await deleteDatabaseEntry(DownloadedEpisode, episode);
    } catch (error) {
      logger.error(error);
      return sendError(res, 500, { message: "Could not delete the episode from the database." });
    }
    try {
      await torrentClient.removeTorrent(torrent)
    } catch (error) {
      logger.error(error);
      return sendError(res, 500, {
        message: `An unknown error occured while removing the torrent. The database entry was removed.`
      })
    }
    sendWebsocketMessage();

    try {
      await fs.rm(TORRENT_DOWNLOAD_PATH + torrent.name, { recursive: true });
    } catch (error) {
      logger.error(error);
      return sendError(res, 500, {
        message: `An unknown error occurred while removing the files. The torrent and database entry were removed.`
      });
    }

    sendOK(res);
  })
);

async function downloadSubtitles(
  directory: string,
  filepath: string,
  torrent: TorrentInfo,
  episode: BasicEpisode,
  language: string,
): Promise<string>{
  if (!subtitleClient) return "Subtitles are currently unavailable. Try again later.";

  let res: AxiosResponse;
  const query = torrent.name.split("[")[0];
  if (!query) {
    logger.error(`Invalid torrent filename '${torrent.name}'.`);
    return "It looks like subtitles for this TV show are unavailable.";
  }
  logger.info(`Searching for subtitles '${query}'...`);
  try {
    res = await subtitleClient.get("/subtitles", {
      params: { 
        query,
        type: "episode",
        season_number: episode.season,
        episode_number: episode.episode,
      },
    });
  } catch (error) {
    logger.error(error);
    (error instanceof AxiosError) && logger.debug(error.response?.data);
    return "The subtitle service is temporarily unavailable.";
  }
  const data = res?.data as any;
  const resultCount = data?.total_count;
  const results = data?.data as any[];
  if (!Array.isArray(results)) {
    logger.error("Received malformatted response from OpenSubtitles");
    logger.debug(res.data);
    return "Subtitles for this episode are temporarily unavailable.";
  }
  if (!resultCount || !results?.length) {
    return "There are no subtitles for this episode.";
  }
  const sorted = results.sort((a, b) => a.attributes.download_count - a.attributes.download_count);
  const [closeMatches, farMatches] = sorted.reduce(([close, far], result) => 
    // The 'release' and 'comments' fields  provide torrent names that they are suitable for; these are 'close' matches
    result.attributes.comments.includes(query) || result.attributes.release.includes(query)
      ? [[...close, result], far]
      // The 'far' matches don't specify our exact torrent name, but they should be for the same show/season/episode
      // This means that there might be some synchronisation errors, which is why the 'far' results are put to the end
      : [close, [...far, result]],
    [[], []]
  );
  // Ensure the close matches are prioritised, but don't throw away the 'far' matches if no close ones have the queried language
  const matches = [...closeMatches, ...farMatches];
  const result = matches.find((result) => result.attributes.language === language)
    // None of the matches have the right language, so send the default language (English)
    ?? matches.find((result) => result.attributes.language === SUBTITLES_DEFAULT_LANGUAGE)
    // Maybe some foreign shows don't even have subtitles in English, so send the most downloaded file there is
    ?? matches[0];
  const fileId = result.attributes.files[0]?.file_id;
  logger.debug(`Downloading subtitles with id '${fileId}'`);
  try {
    res = await subtitleClient.post("/download", {
      file_id: +fileId,
      file_name: `${episode.showName} ${serialiseEpisode(episode)}`,
      sub_format: "webvtt",
    });
  } catch (error) {
    logger.error(error);
    (error instanceof AxiosError) && logger.debug(error.response?.data);
    return "Subtitles for this episode were found but could not be downloaded. Try again later.";
  }
  const url = res.data.link;
  if (!url) {
    return "Subtitles for this episode were found but malformatted. Try again later.";
  }
  try {
    res = await axios({
      url,
      method: "GET",
      responseType: "stream",
    })
  } catch (error) {
    logger.error(error);
    return "Downloading the subtitles failed. Try again later.";
  }
  try {
    await fs.mkdir(directory, { recursive: true });
  } catch (error) {
    logger.error(error);
    return "Could not save the subtitles to the server.";
  }
  const writer = createWriteStream(filepath);
  return new Promise((resolve) => {
    res.data.pipe(writer);
    let errorMessage = "";
    writer.on("error", (error) => {
      logger.error(error);
      errorMessage = "Could not save the subtitle file.";
      writer.close();
    });
    writer.on("close", () => {
      resolve(errorMessage);
    });
  });
}

router.get("/subtitles/:showName/:season/:episode", (req, res) => 
  handleTorrentRequest(req, res, async (torrent, episode) => {
    const directory = `${SUBTITLES_PATH}/${episode.showName}/${episode.season}/${episode.episode}`;
    const filepath = `${directory}/${SUBTITLES_FILENAME}`;
    try {
      await fs.access(filepath);
      if (process.env.SUBTITLES_API_KEY_DEV && SUBTITLES_FORCE_DOWNLOAD_NEW) {
        throw new Error("Force fresh download of subtitles");
      }
    } catch (error) {
      const language = `${req.query.lang || SUBTITLES_DEFAULT_LANGUAGE}`.toLowerCase();
      const errorMessage = await downloadSubtitles(directory, filepath, torrent, episode, language);
      if (errorMessage) {
        sendError(res, 400, { message: errorMessage });
        return;
      }
    }
    setCacheControl(res, STATIC_CACHE_DURATION_MINS);
    res.status(200).sendFile(filepath);
    logResponse(res, `${getStatusText(200)} (${SUBTITLES_FILENAME})`);
  })       
);


import express, { Request, Response } from "express";
import expressWs from "express-ws";
import { CronJob } from "cron";
import { exec } from "child_process";
import { getLogger } from "../middleware/logging";
import { LikedShows, User, WatchedEpisodes, DownloadedEpisode } from "../sequelize";
import { TorrentStatus } from "../models"
import axios from "axios";
import {
  createDatabaseEntry,
  readAllDatabaseEntries,
  readDatabaseEntry,
  sendError,
  sendOK,
  updateDatabaseEntry,
  updateEndpoint,
} from "../util";
import { searchTorrent } from "../torrentIndexer";
import { TorrentClient } from "../torrentClient";

export const router = express.Router() as expressWs.Router;

const WS_RESPONSE_INTERVAL_MS = 4000;

const logger = getLogger(__filename);
let torrentClient: TorrentClient;

type WatchedData = { [season: string]: number[] };

type WatchedShowData = { [showId: string]: WatchedData };

interface TvShow {
  id: number;
  name: string;
  // ...
  episodes: Episode[];
}

interface Episode {
  episode: number;
  season: number;
  name: string;
  air_date: string;
}

const EPISODATE_API_BASE = "https://episodate.com/api/show-details?q=";

const hasEpisodeAired = (episode: Episode) =>
  new Date() > new Date(episode.air_date + " Z");

const serialiseEpisode = (episode: Episode) =>
  "S" +
  `${episode.season}`.padStart(2, "0") +
  "E" +
  `${episode.episode}`.padStart(2, "0");

async function downloadEpisode(tvShow: TvShow, episode: Episode) {
  const episodeSearchQuery = `${tvShow.name} ${serialiseEpisode(episode)}`;
  const magnetLink = await searchTorrent(episodeSearchQuery);
  logger.debug(`Found unwatched episode, searching for '${episodeSearchQuery}'.`)
  if (!magnetLink) {
    logger.error("Search query turned up empty. Either no torrents available, or indexer is outdated.");
    return null;
  }
  if (process.platform === "win32") {
    exec(`start ${magnetLink}`);
    return null;
  }
  const torrentInfo = await torrentClient.addTorrent(magnetLink);
  if (!torrentInfo) {
    logger.error(`Adding the torrent to the client failed.`);
    return null;
  }
  const downloadedEpisode = await DownloadedEpisode.create({
    torrentId: torrentInfo.id, 
    showId: tvShow.id,
    episode: episode.episode,
    season: episode.season,
    status: TorrentStatus.PENDING,
  });
  await updateEndpoint(DownloadedEpisode);
  logger.info(`Successfully added new torrent with id '${torrentInfo.id}'.`);
  return downloadedEpisode;
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
            DownloadedEpisode.findOne({ where: {
              showId: tvShow.id,
              episode: episode.episode,
              season: episode.season,
            }}).then((result) => result || downloadEpisode(tvShow, episode));
          }
        },
        (error) =>
          logger.error(
            `Could not retrieve liked show ${likedShowId} details. ${error.name} ${error.message} ${error.code}`
          )
      );
    }
  }
}

export function init() {
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

function validateNaturalNumber(value: any) {
  if (!Number.isInteger(value)) return `Key '${value}' must be an integer.`;
  if (value < 0) return `Key '${value} cannot be negative.`;
}

/** Ensures that the request body is an array of non-negative integers. */
function validateNaturalList(list: any, res: Response) {
  const reject = (message: string) => void sendError(res, 400, { message });

  if (!Array.isArray(list)) return reject("Request body must be an array.");
  for (const id of list) {
    const errorMessage = validateNaturalNumber(id);
    if (errorMessage) return reject(errorMessage);
  }
  return list as number[];
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

// GET all admin downloaded episodes
router.get("/downloaded-episodes", (_, res) => 
  readAllDatabaseEntries(DownloadedEpisode, res)        
);

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

  const downloadedEpisode = await downloadEpisode(tvShow, episode);
  if (downloadedEpisode) return sendOK(res, downloadedEpisode);
  sendError(res, 400, {
    message: `Invalid TV show '${tvShow.name}' or episode '${serialiseEpisode(episode)}'.`
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

async function getTorrentInfo(data: any) {
  const info = await torrentClient.getTorrentInfo();
  return info;
}

router.ws("/ws", (ws, req) => {
  if (!torrentClient) {
    logger.error("Websocket connection established without active torrent client.");
    return;
  }
  
  let minNextResponseTimestamp = new Date().getTime();

  ws.on("message", (msg) => {
    let evt: { type: string; data: any };

    try {
      evt = JSON.parse(msg);
    } catch (error) {
      logger.error(`Could not parse websocket message '${msg}'. ${error}`);
      return;
    }

    /** The callback to call after a message event which should resolve to the data to be sent back. */
    let action: (data: any) => Promise<any>;

    switch (evt.type) {
      case "poll":
        action = getTorrentInfo;
        break;
      default:
        logger.warn(`Unknown message type '${evt.type}' received in websocket connection.`);
        return;
    }

    const currentTimestamp = new Date().getTime();
    const delayBeforeResponseMs = Math.min(0, minNextResponseTimestamp - currentTimestamp);

    setTimeout(async () => {
      data = await action(evt.data);
      ws.send(JSON.stringify({ data }));
    }, delayBeforeResponseMs);

    minNextResponseTimestamp += delayBeforeResponseMs + WS_RESPONSE_INTERVAL_MS;
  });
});


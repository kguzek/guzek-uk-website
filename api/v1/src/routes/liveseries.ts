import express, { Request, Response } from "express";
import { getLogger } from "../middleware/logging";
import { LikedShows, WatchedEpisodes } from "../sequelize";
import {
  createDatabaseEntry,
  readAllDatabaseEntries,
  readDatabaseEntry,
  sendError,
  sendOK,
  updateDatabaseEntry,
} from "../util";

export const router = express.Router();

const logger = getLogger(__filename);

type WatchedData = { [season: string]: number[] };

type WatchedShowData = { [showId: string]: WatchedData };

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


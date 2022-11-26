import express from "express";
import { Op } from "sequelize";
import { TuLalem } from "../sequelize";
import {
  createDatabaseEntry,
  readAllDatabaseEntries,
  sendOK,
  sendError,
} from "../util";
import { getDistanceBetweenTwoPoints } from "../maths";
import { LatLngArr } from "../models";
export const router = express.Router();

/** The minimum distance a point has to be apart from all other points on the map. */
const MIN_POINT_DISTANCE_KM = 0.1; // 100 metres

/** The number of milliseconds that need to be waited before a new entry can be made.*/
const MIN_WAIT_TIME_MS = 10 * 60 * 1000; // 10 minutes

/** Ensures that the coordinates are not to close to any previous entries.
 *  Returns an error message or `null` if the coordinates are valid.
 */
async function validateCoordinates(coords?: number[], userUUID?: string) {
  if (!coords) return "Coordinates not provided.";
  if (coords.length !== 2)
    return "Coordinates must have a latitude and longitude.";
  if (!userUUID) return "User not logged in.";

  const entries = await TuLalem.findAll({
    where: { userUUID },
  });
  let cooldownMillis = 0;
  for (const entry of entries) {
    const testCoords = entry.get("coordinates") as LatLngArr;
    const distance = getDistanceBetweenTwoPoints(
      coords as LatLngArr,
      testCoords
    );
    if (distance < MIN_POINT_DISTANCE_KM) {
      return "You are too close to a previous entry.";
    }
    const timestamp = entry.get("timestamp") as Date;
    const currentCooldownMillis =
      timestamp.getTime() + MIN_WAIT_TIME_MS - new Date().getTime();
    if (currentCooldownMillis > cooldownMillis) {
      cooldownMillis = currentCooldownMillis;
    }
  }
  // if (cooldownMillis > 0) {
  //   return `You must wait ${cooldownMillis / 1000}s before you can do that.`;
  // }

  return null;
}

router
  // POST new coordinates
  .post("/", async (req, res) => {
    const coords = req.body.coordinates;
    const errorMessage = await validateCoordinates(coords, req.user?.uuid);
    if (errorMessage) {
      return sendError(res, 400, { message: errorMessage });
    }

    const [lat, lng] = req.body.coordinates;

    const modelParams = {
      coordinates: {
        type: "Point",
        coordinates: [lng, lat],
      },
      userUUID: req.user?.uuid,
    };
    await createDatabaseEntry(TuLalem, req, res, modelParams);
  })

  // GET all coordinates
  .get("/", async (req, res) => {
    const user = req.query.user;
    if (!user) {
      // GET coordinates of all users
      await readAllDatabaseEntries(TuLalem, res);
      return;
    }

    // GET the last entry made in the last 10 mins by given user
    const timespanMillis = req.query.timespan
      ? +req.query.timespan * 60_000
      : MIN_WAIT_TIME_MS;
    const fromTimestamp = new Date().getTime() - timespanMillis;

    let result;
    try {
      result = await TuLalem.findOne({
        where: {
          userUUID: user,
          timestamp: { [Op.gte]: fromTimestamp },
        },
        order: [["timestamp", "DESC"]],
      });
    } catch (error) {
      return sendError(res, 500, error as Error);
    }
    sendOK(res, result);
  });

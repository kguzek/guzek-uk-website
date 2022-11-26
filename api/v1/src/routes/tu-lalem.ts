import express from "express";
import { Op } from "sequelize";
import { TuLalem } from "../sequelize";
import {
  createDatabaseEntry,
  readAllDatabaseEntries,
  sendOK,
  sendError,
} from "../util";
export const router = express.Router();

/** The default timespan to search for in the database, in minutes. */
const DEFAULT_QUERY_TIMESPAN = "10";

/** Ensures that the coordinates are not to close to any previous entries.
 *  Returns an error message or `null` if the coordinates are valid.
 */
async function validateCoordinates(coords?: number[]) {
  if (!coords) return "Coordinates not provided.";
  if (coords.length < 2)
    return "Coordinates must have a latitude and longitude.";
  // TODO: implement actual validation
  return null;
}

router
  // POST new coordinates
  .post("/", async (req, res) => {
    const coords = req.body.coordinates;
    const errorMessage = await validateCoordinates(coords);
    if (errorMessage) {
      return sendError(res, 400, { message: errorMessage });
    }

    const modelParams = {
      timestamp: req.body.timestamp,
      coordinates: {
        type: "Point",
        coordinates: req.body.coordinates,
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
    const timespanMins = req.query.timespan ?? DEFAULT_QUERY_TIMESPAN;
    const fromTimestamp = new Date().getTime() - +timespanMins * 60_000;

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

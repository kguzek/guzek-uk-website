import express from "express";
import { Op } from "sequelize";
import { TuLalem } from "../sequelize";
import {
  createDatabaseEntry,
  readAllDatabaseEntries,
  readDatabaseEntry,
  sendOK,
	sendError,
} from "../util";
export const router = express.Router();

/** Ensures that the coordinates are not to close to any previous entries.
 *  Returns an error message or `null` if the coordinates are valid.
 */
async function validateCoordinates(coords?: number[]): string | null {
	if (!coords) return "Coordinates not provided.";
	if (coords.length < 2) return "Coordinates must have a latitude and longitude.";
	// TODO: implement actual validation
	return null;
}

router
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
		};
    await createDatabaseEntry(TuLalem, req, res, modelParams);
  })

  .get("/", async (req, res) => {
    const user = req.query.user;
    if (!user) {
      return readAllDatabaseEntries(TuLalem, res);
    }

    const timespan = req.query.timespan ?? "10"; // minutes
    const fromTimestamp = new Date().getTime() - +timespan * 60_000;

    const entries = await readDatabaseEntry(
      TuLalem,
      res,
      {
        userUUID: user,
        timestamp: { [Op.gte]: fromTimestamp },
      },
      undefined,
      true
    );
    if (entries) sendOK(res, entries);
  });

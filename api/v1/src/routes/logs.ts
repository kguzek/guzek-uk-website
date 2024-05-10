import { Response, Router } from "express";
import { readdir, readFile } from "fs/promises";
import { getLogger } from "../middleware/logging";
import { isInvalidDate, sendError, sendOK, setCacheControl } from "../util";

export const router = Router();
const logger = getLogger(__filename);

const BASE_DIR = "logs";

async function getLogDates(path: string = "") {
  let filenames;
  try {
    filenames = await readdir(BASE_DIR + path);
  } catch (error) {
    logger.error(`Could not read log filenames: ${error}`);
    return [];
  }
  return filenames.map((filename) => filename.replace(/.log$/, ""));
}

async function readLogFile(res: Response, date: string) {
  let buffer: Buffer;
  try {
    buffer = await readFile(`${BASE_DIR}/${date}.log`);
  } catch (error) {
    logger.error(error);
    return sendError(res, 500, error as Error);
  }
  const logStrings = buffer.toString().split("\n");

  const logs = logStrings
    .filter((log) => log.trim())
    .map((log) => JSON.parse(log.trim()));
  setCacheControl(res, 60);
  sendOK(res, { date, logs });
}

router.get("/error", (_req, res) => readLogFile(res, "error"));

router.get("/date/:date", async (req, res) => {
  const queryDateString = req.params.date;
  const queryDateObject = new Date(queryDateString + " Z");
  if (isInvalidDate(queryDateObject))
    return sendError(res, 400, {
      message: `Date parameter '${queryDateString}' must be a valid date.`,
    });
  const date = queryDateObject.toISOString().split("T")[0];
  let dates;
  try {
    dates = await getLogDates();
  } catch (error) {
    return sendError(res, 500, error as Error);
  }
  if (!dates.includes(date)) return sendOK(res, { date, logs: [] });
  readLogFile(res, date);
});


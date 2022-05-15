import fs from "fs";
import express from "express";
const router = express.Router();
import { sendError, sendOK } from "../util";

const LOGS_DIRECTORY = "logs/";
const ERROR_LOG_FILE = "error.log";

router
  // GET all log files
  .get("/", (_req, res) => {
    fs.readFile(LOGS_DIRECTORY + ERROR_LOG_FILE, (fileErr, data) => {
      if (fileErr) {
        // The file could not be read
        return sendError(res, 500, fileErr);
      }
      // Replace Windows CRLF with regular linefeeds
      const rawString = data.toString().replace(/\r\n/g, "\n");
      // Split the string into an array of lines, ignoring empty lines
      const lines = rawString.split("\n").filter((line) => line);
      // Parse each line as a JSON object
      const parsed = lines.map((line, index) => {
        try {
          return JSON.parse(line);
        } catch (parseErr) {
          // The string could not be parsed; put in its place the error message
          const msg = (parseErr as Error).message;
          const errorDescription = `Error parsing line ${index + 1}: ${msg}.`;
          return { errorDescription };
        }
      });
			// Send the formatted result JS object
      sendOK(res, {
        numEntries: parsed.length,
        entries: parsed,
      });
    });
  });

module.exports = router;

// Initialise dependencies
import cors from "cors";
import express from "express";
import expressWs from "express-ws";
import path from "path";
import dotenv from "dotenv";
const DEBUG_MODE = process.env.NODE_ENV === "development";
// In production mode, this code is run from /api/v1/dist/index.js
// In development mode, it is in /api/v1/index.ts
// The env file is in /api/.env, so adjust accordingly
const ENV_FILE_PATH = DEBUG_MODE ? "../.env" : "../../.env";
const dotEnvPath = path.resolve(__dirname, ENV_FILE_PATH);
dotenv.config({ path: dotEnvPath });
const password = require("s-salt-pepper");

import { sendError } from "./src/util";
import getMiddleware from "./src/middleware";
import { getLogger } from "./src/middleware/logging";

const logger = getLogger(__filename);

// Initialise the application instance
export const wsInstance = expressWs(express());
const app = wsInstance.app;
app.set("trust proxy", 1);

// Determine the server port
const PORT = process.env.NODE_PORT;

// Define the endpoints
const ENDPOINTS = [
  "pages",
  "auth",
  "updated",
  "tu-lalem",
  "liveseries",
  "logs",
  "torrents",
];

if (DEBUG_MODE) {
  // Add newline before app output for readability
  console.log();
}

/** Initialises the HTTP RESTful API server. */
async function initialise() {
  const iterations = process.env.HASH_ITERATIONS;
  if (!iterations) {
    logger.error("No HASH_ITERATIONS environment variable set.");
    return;
  }
  password.iterations(parseInt(iterations));
  password.pepper(process.env.HASH_PEPPER);

  // Enable middleware
  app.use(cors());
  app.use(express.json());
  app.use(getMiddleware());

  // Enable individual API routes
  for (const endpoint of ENDPOINTS) {
    const middleware = await import("./src/routes/" + endpoint);
    if (middleware.init) middleware.init(ENDPOINTS);
    app.use("/" + endpoint, middleware.router);
  }

  // Catch-all 404 response for any other route
  app.all("*", (req, res) =>
    sendError(res, 404, {
      message: `The resource at '${req.originalUrl}' was not located.`,
    })
  );

  app.listen(PORT, () => logger.info(`API listening on port ${PORT}.`));
}

if (PORT) {
  initialise();
} else {
  logger.error("No server port environment variable set.");
}

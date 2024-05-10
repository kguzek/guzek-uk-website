// Initialise dependencies
import cors from "cors";
import express from "express";
import path from "path";
import dotenv from "dotenv";
const dotEnvPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: dotEnvPath });
const password = require("s-salt-pepper");

import { sendError } from "./src/util";
import getMiddleware from "./src/middleware";
import { getLogger } from "./src/middleware/logging";

const logger = getLogger(__filename);

// Initialise the application instance
const app = express();

// Determine the server port
const PORT = process.env.NODE_PORT;

// Define the endpoints
const ENDPOINTS = [
  "pages",
  "auth",
  "updated",
  "tu-lalem",
  "cocodentax-admin/allegro",
  "cocodentax-admin/pocztex",
  "liveseries",
  "logs",
];

console.log(); // Add newline before app output for readability

/** Initialises the HTTP RESTful API server. */
async function initialise() {
  const iterations = process.env.HASH_ITERATIONS;
  if (!iterations) {
    console.log(process.env);
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

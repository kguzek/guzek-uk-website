// Initialise dependencies
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const { sendError } = require("./util");
const { getLogger, loggingMiddleware } = require("./logger");

const logger = getLogger(__filename);

// Initialise the application instance
const app = express();

// Determine the server port
const PORT = process.env.NODE_PORT;

console.log(); // Add newline before app output for readability

/** Initialises the HTTP RESTful API server. */
function initialise() {
  // Enable middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(loggingMiddleware);

  // Enable individual API routes
  app.use("/pages", require("./routes/pages"));
  app.use("/logs", require("./routes/logs"));

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

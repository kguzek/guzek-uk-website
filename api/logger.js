const path = require("path");
const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

const c = {
  clr: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fgBlack: "\x1b[30m",
  fgRed: "\x1b[31m",
  fgGreen: "\x1b[32m",
  fgYellow: "\x1b[33m",
  fgBlue: "\x1b[34m",
  fgMagenta: "\x1b[35m",
  fgCyan: "\x1b[36m",
  fgWhite: "\x1b[37m",

  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

const colours = {
  lbl: {
    error: c.bgRed,
    warn: c.bgYellow + c.fgBlack,
    response: c.bgMagenta + c.fgBlack,
    request: c.fgMagenta,
    info: c.fgGreen,
    debug: c.fgCyan,
  },
  msg: {
    error: c.fgRed + c.bright,
    warn: c.fgYellow + c.bright,
  },
};

const logFormat = format.printf(({ timestamp, level, label, message }) => {
  const lvl = (colours.lbl[level] || "") + level + c.clr;
  const lbl = c.fgBlue + label + c.clr;
  const msg = (colours.msg[level] || "") + message + c.clr;
  return `${c.dim + timestamp + c.clr} ${lvl} [${lbl}]: ${msg}`;
});

const jsonFormat = format.combine(format.json());

const defaultFileTransport = new transports.DailyRotateFile({
  filename: "%DATE%",
  dirname: "logs",
  extension: ".log",
  maxFiles: "14d",
  format: jsonFormat,
});

const errorFileTransport = new transports.File({
  filename: "logs/error.log",
  level: "error",
  format: jsonFormat,
});

function getLogger(filename) {
  // idk this magic got it from stackoverflow
  // https://stackoverflow.com/a/56091110/15757366

  const loggerOptions = {
    level: "info",
    levels: {
      error: 0,
      warn: 1,
      response: 2,
      request: 3,
      info: 4,
      debug: 5,
    },
    format: format.combine(
      format.label({ label: path.basename(filename) }),
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      // Format the metadata object
      format.metadata({
        fillExcept: ["message", "level", "timestamp", "label"],
      })
    ),
    transports: [defaultFileTransport, errorFileTransport],
  };
  if (process.env.NODE_ENV === "development") {
    loggerOptions.level = "debug";
    // Special options for when running from a development environment
    loggerOptions.transports.push(
      // Log output to the console
      new transports.Console({
        format: logFormat,
      })
    );
  }
  const logger = createLogger(loggerOptions);

  return logger;
}

const logger = getLogger(__filename);

async function loggingMiddleware(req, _res, next) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const metadata = { ip, ...req.body };
  logger.request(`${req.method} ${req.originalUrl}`, metadata);
  next();
}

module.exports = { getLogger, loggingMiddleware };

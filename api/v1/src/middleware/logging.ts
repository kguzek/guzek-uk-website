import { NextFunction, Request, Response } from "express";
import path from "path";
import {
  createLogger,
  format,
  Logger,
  LoggerOptions,
  transports,
} from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const c = {
  clear: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
  },

  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
  },
};

interface CustomLoggerOptions extends LoggerOptions {
  transports: Array<
    | transports.FileTransportInstance
    | transports.ConsoleTransportInstance
    | DailyRotateFile
  >;
}

type LogFunction = (message: string, metadata?: Record<string, any>) => void;

interface CustomLogger extends Logger {
  request: LogFunction;
  response: LogFunction;
}

type ColourMap = { [logLevel: string]: string };

const colours: { level: ColourMap; message: ColourMap } = {
  level: {
    error: c.bg.red,
    warn: c.bg.yellow + c.fg.black,
    response: c.bg.magenta + c.fg.black,
    request: c.fg.magenta,
    info: c.fg.green,
    debug: c.fg.cyan,
  },
  message: {
    error: c.fg.red + c.bright,
    warn: c.fg.yellow + c.bright,
  },
};

const logFormat = format.printf(
  ({ timestamp, level, label, message, metadata }) => {
    if (typeof message !== "string") message = JSON.stringify(message);
    message = (colours.message[level] ?? "") + message + c.clear;
    level = (colours.level[level] ?? "") + level + c.clear;
    label = c.fg.blue + label + c.clear;
    return `${c.dim + timestamp + c.clear} ${level} [${label}]: ${message}`;
  }
);

const jsonFormat = format.combine(format.json());

const defaultFileTransport = new DailyRotateFile({
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

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  response: 2,
  request: 3,
  info: 4,
  debug: 5,
} as const;

// Idk this magic got it from stackoverflow
// https://stackoverflow.com/a/56091110/15757366

const loggerOptions: CustomLoggerOptions = {
  level: "info",
  levels: LOG_LEVELS,
  format: format.combine(
    // format.label({ label: path.basename(filename) }),
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
  const consoleTransport = new transports.Console({
    format: logFormat,
  });
  loggerOptions.transports.push(consoleTransport);
}
const baseLogger = createLogger(loggerOptions);

/** Gets the logger instance for the given source code file. */
export function getLogger(filename: string) {
  const label = path.basename(filename);
  return Object.fromEntries(
    Object.keys(LOG_LEVELS).map((level) => [
      level,
      (message: any, metadata?: any) =>
        baseLogger[level as keyof Logger](message, { ...metadata, label }),
    ])
  ) as unknown as CustomLogger;
}

const logger = getLogger(__filename);

const getRequestIP = (req: Request) =>
  req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

export async function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body = Array.isArray(req.body) ? [...req.body] : { ...req.body };
  // Ensure passwords are not logged in plaintext
  for (const sensitiveField of ["password", "oldPassword", "newPassword"]) {
    if (!body[sensitiveField]) continue;
    body[sensitiveField] = "********";
  }
  const ip = getRequestIP(req);
  (res as any).ip = ip;
  logger.request(`${req.method} ${req.originalUrl}`, { ip, body });
  next();
}

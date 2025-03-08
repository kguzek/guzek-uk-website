export enum ErrorCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ServerError = 500,
}

export const DownloadStatus = {
  STOPPED: 1,
  PENDING: 2,
  COMPLETE: 3,
  FAILED: 4,
  UNKNOWN: 5,
  VERIFYING: 6,
};

export const LOG_LEVELS = [
  "crit",
  "error",
  "warn",
  "info",
  "verbose",
  "debug",
  "request",
  "response",
  "http",
] as const;

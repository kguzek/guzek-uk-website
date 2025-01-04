export enum ErrorCode {
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ServerError = 500,
}

export enum Language {
  EN = "EN",
  PL = "PL",
}

export const LOG_LEVEL_ICONS = {
  error: "warning",
  request: "download",
  response: "upload",
  info: "info-circle",
  debug: "info-circle",
} as const;

export const DownloadStatus = {
  STOPPED: 1,
  PENDING: 2,
  COMPLETE: 3,
  FAILED: 4,
  UNKNOWN: 5,
  VERIFYING: 6,
};

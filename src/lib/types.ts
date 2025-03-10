import type { NextRequest, NextResponse } from "next/server";

import type { LOCALES } from "./constants";
import type { DownloadStatus, LOG_LEVELS } from "./enums";

// #region TypeScript Utilties

export type ValueOf<T> = T[keyof T];

export type ParseInt<T> = T extends `${infer N extends number}` ? N : never;

export type ArrayIndex<T extends readonly unknown[]> = ParseInt<
  Exclude<keyof T, keyof []>
>;

export type ArrayElement<T extends readonly unknown[]> = T[ArrayIndex<T>];

// #endregion

export type UserLocale = ArrayElement<typeof LOCALES>;

// #region Legacy Admin Logs

type LogLevel = (typeof LOG_LEVELS)[number];

export interface LegacyLogEntry {
  level: LogLevel;
  message: string | NodeJS.ErrnoException;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  timestamp: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: { filename: string; [key: string]: any };
  timestamp: string;
}

export type LogResponse = { date: string; logs: (LegacyLogEntry | LogEntry)[] };

// #endregion

// #region API Responses

export type ApiMessage = { message?: string };

export type ErrorResponseBodyCustom = { [code: string]: string };
export type ErrorResponseSingle = ApiMessage & {
  type?: string;
  data?: { id?: string } & (ErrorResponseMultiple | undefined);
};
export type ErrorResponseMultiple = { errors: ErrorResponseSingle[] };
export type ErrorResponseBodyPayloadCms = ErrorResponseSingle | ErrorResponseMultiple;

export type ErrorResponseBody = ErrorResponseBodyCustom | ErrorResponseBodyPayloadCms;

// #endregion

// #region LiveSeries

export type DownloadStatusType = ValueOf<typeof DownloadStatus>;

export interface DownloadedEpisode {
  status: DownloadStatusType;
  showName: string;
  season: number;
  episode: number;
  progress?: number;
  speed?: number;
  eta?: number;
}

// #endregion

// #region Middleware

export type CustomMiddleware<T extends Array<unknown> = Array<never>> = (
  req: NextRequest,
  ...args: T
) => NextResponse | Promise<NextResponse>;

export type MiddlewareFactory<T extends Array<unknown> = Array<never>> = (
  middleware: CustomMiddleware<T>,
) => CustomMiddleware<T>;

// #endregion

export type Numeric = number | `${number}`;

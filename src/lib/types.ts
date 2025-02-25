import type { NextRequest, NextResponse } from "next/server";
import type { Dispatch, SetStateAction } from "react";

import type { DownloadStatus, LOG_LEVELS } from "./enums";
import type { getTranslations } from "./providers/translation-provider";

export type UserLocale = Awaited<ReturnType<typeof getTranslations>>["userLocale"];

export interface PageContent {
  content: string;
}

export interface BaseMenuItem {
  id: number;
  title: string;
  url: string;
  label?: string;
}

export interface MenuItem extends BaseMenuItem {
  localUrl: boolean;
  adminOnly: boolean;
  shouldFetch: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  serverUrl?: string | null;
  created_at?: string;
  modified_at?: string;
}

/** Admin logs */

export type LogLevel = (typeof LOG_LEVELS)[number];

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

export interface ErrorPageContent {
  title: string;
  body: string;
}

export type ApiMessage = { message?: string };

export type ErrorResponseBodyCustom = { [code: string]: string };
export type ErrorResponseSingle = ApiMessage & {
  type?: string;
  data?: { id?: string } & (ErrorResponseMultiple | undefined);
};
export type ErrorResponseMultiple = { errors: ErrorResponseSingle[] };
export type ErrorResponseBodyPayloadCms = ErrorResponseSingle | ErrorResponseMultiple;

export type ErrorResponseBody = ErrorResponseBodyCustom | ErrorResponseBodyPayloadCms;

export type DownloadStatusType = (typeof DownloadStatus)[keyof typeof DownloadStatus];

export interface DownloadedEpisode {
  status: DownloadStatusType;
  showName: string;
  season: number;
  episode: number;
  progress?: number;
  speed?: number;
  eta?: number;
}

export type StateSetter<T> = Dispatch<SetStateAction<T>>;

export const CAROUSEL_INDICATOR_FULL_WIDTH = 140;

export const DEFAULT_PAGE_DATA: PageContent = {
  content: "Oops! This page hasn't been implemented yet.",
};

export type CustomMiddleware = (req: NextRequest) => NextResponse | Promise<NextResponse>;

export type MiddlewareFactory = (middleware: CustomMiddleware) => CustomMiddleware;

export type ModalHandler = (primary: boolean) => void;

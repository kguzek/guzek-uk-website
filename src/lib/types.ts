import { NextRequest, NextResponse } from "next/server";
import { Dispatch, SetStateAction } from "react";
import { DownloadStatus, LOG_LEVELS } from "./enums";

export interface PageContent {
  content: string;
}

export interface MenuItem {
  id: number;
  label?: string;
  title: string;
  url: string;
  localUrl: boolean;
  adminOnly: boolean;
  shouldFetch: boolean;
}

export interface User {
  uuid?: string;
  username: string;
  email: string;
  admin: boolean;
  created_at?: string;
  modified_at?: string;
  serverUrl?: string;
}

/** Admin logs */

export type LogLevel = (typeof LOG_LEVELS)[number];

export interface LegacyLogEntry {
  level: LogLevel;
  message: string | NodeJS.ErrnoException;
  label: string;
  metadata: any;
  timestamp: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  metadata: { filename: string; [key: string]: any };
  timestamp: string;
}

export type LogResponse = { date: string; logs: (LegacyLogEntry | LogEntry)[] };

export interface ErrorPageContent {
  title: string;
  body: string;
}

export interface UserShows {
  likedShows?: number[];
  subscribedShows?: number[];
}

export interface TvShowList {
  total: string;
  page: number;
  pages: number;
  tv_shows: TvShowDetailsShort[];
}

export interface TvShowDetailsShort {
  id: number;
  name: string;
  permalink: string;
  start_date: string;
  end_date: string | null;
  country: string;
  network: string;
  status: string;
  image_thumbnail_path: string;
}

export type LikedShows = Record<number, TvShowDetails>;

export interface TvShowDetails extends TvShowDetailsShort {
  url: string;
  description: string;
  description_source: string;
  runtime: number;
  youtube_link: null | string;
  image_path: string;
  rating: string;
  rating_count: string;
  countdown: null | string;
  genres: string[];
  pictures: string[];
  episodes: Episode[];
}

export type Episode = {
  season: number;
  episode: number;
  name: string;
  air_date: string;
};

export interface WatchedEpisodes {
  [season: number]: number[];
}

export interface ShowData<T> {
  [showId: number]: T;
}

export type DownloadStatusType =
  (typeof DownloadStatus)[keyof typeof DownloadStatus];

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

export type CustomMiddleware = (
  req: NextRequest,
) => NextResponse | Promise<NextResponse>;

export type MiddlewareFactory = (
  middleware: CustomMiddleware,
) => CustomMiddleware;

export type ModalHandler = (primary: boolean) => void;

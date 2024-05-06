import { Dispatch, SetStateAction } from "react";

export interface PageContent {
  content: string;
}

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  localUrl: boolean;
  adminOnly: boolean;
  shouldFetch: boolean;
}

export interface User {
  uuid: string;
  username: string;
  email: string;
  admin: boolean;
  created_at: string;
  modified_at: string;
}

export enum ErrorCode {
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
}

export enum Language {
  EN = "EN",
  PL = "PL",
}

export interface ErrorPageContent {
  title: string;
  body: string;
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

export type StateSetter<T> = Dispatch<SetStateAction<T>>;

import { Page, PageContent, Token, TuLalem, User } from "./sequelize";

export type RequestMethod = "GET" | "PUT" | "POST" | "DELETE" | "PATCH";

export interface RecipientData {
  name: string;
  firstName?: string;
  lastName?: string;
  company: string;
  street: string;
  house: string;
  apartment: null;
  place: string;
  postalCode: string;
  countryIsoAlfa2Code: string;
  phoneNumber: string;
  email: string;
  pni?: string;
}

export interface Order {
  id: string;
  contentDesc: string;
  cost: number;
  recipientData: RecipientData;
}

export const ORDER_ATTRIBUTES = [
  "id",
  "contentDesc",
  "cost",
  "recipientData",
] as (keyof Order)[];

export type LatLngObj = { lat: number; lng: number };
export type LatLngArr = [number, number];
export type LatLng = LatLngObj | LatLngArr;

export type ModelType =
  | typeof Page
  | typeof PageContent
  | typeof User
  | typeof Token
  | typeof TuLalem;

export interface UserObj {
  uuid: string;
  username: string;
  email: string;
  admin?: boolean;
}

export interface TorrentInfo {
  id: number;
  name: string;
  status: number;
  rateDownload?: number;
  eta?: number;
  percentDone?: number;
}

export const DownloadStatus = {
  STOPPED: 1,
  PENDING: 2,
  COMPLETE: 3,
  FAILED: 4,
};

type WatchedData = { [season: string]: number[] };

export type WatchedShowData = { [showId: string]: WatchedData };

export interface TvShow {
  id: number;
  name: string;
  // ...
  episodes: Episode[];
}

export interface Episode {
  episode: number;
  season: number;
  name: string;
  air_date: string;
}

export const TORRENT_DOWNLOAD_PATH = "/var/lib/transmission-daemon/downloads/";

export const TORRENT_STATUSES = [
  "Stopped",
  "Unknown status 1",
  "Unknown status 2",
  "Unknown status 3",
  "Downloading",
  "Unknown status 5",
  "Idle/Seeding",
];



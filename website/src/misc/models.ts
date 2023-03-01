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
  Forbidden = 403,
  NotFound = 404,
}

export enum Language {
  EN = "EN",
  PL = "PL",
}

export type ErrorPageContent = {
  title: string;
  body: string;
};

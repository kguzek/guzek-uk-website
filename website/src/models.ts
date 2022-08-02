export interface PageContent {
  content: string;
}

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  adminOnly: boolean;
  shouldFetch: boolean;
}

export interface User {
  name: string;
  surname: string;
  email: string;
  admin: boolean;
  token: string;
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

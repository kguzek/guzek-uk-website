import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";

import type { ErrorCode, Language } from "@/lib/enums";
import type { DownloadedEpisode } from "@/lib/types";

import { ENGLISH } from "./english";
import { POLISH } from "./polish";

export type Translation = Readonly<{
  footer: (year: string) => string;
  loading: string;
  redirecting: string;
  language: string;
  loginShort: string;
  format: {
    date: Intl.DateTimeFormat;
    dateShort: Intl.DateTimeFormat;
    dateTime: Intl.DateTimeFormat;
    dateTimeShort: Intl.DateTimeFormat;
    number: Intl.NumberFormat;
    quote: (text: string) => string;
  };
  networkError: string;
  unknownError: string;
  loggedOut: string;
  placeholder: {
    email: string;
    username: string;
  };
  profile: {
    title: string;
    body: string;
    loading: string;
    invalidCredentials: string;
    passwordMismatch: string;
    passwordLength: string;
    serverUrlUpdated: (url: string) => string;
    formDetails: {
      username: string;
      email: string;
      loginPrompt: string;
      creationDate: string;
      type: string;
      administrator: string;
      regularUser: string;
      password: string;
      passwordRepeat: string;
      login: string;
      signup: string;
      or: string;
      haveAccountAlready: string;
      logout: string;
      serverUrl: string;
      success: string;
      verifyEmail: {
        header: string;
        info: (email?: string) => string;
        cta: string;
        success: string;
      };
      forgotPassword: {
        header: string;
        info: (email?: string) => string;
        success: string;
      };
      resetPassword: {
        header: string;
        field: string;
        submit: string;
        success: string;
      };
    };
  };
  admin: {
    title: string;
    contentManager: {
      title: string;
      selectedPage: string;
      addPage: string;
      formDetails: {
        title: string;
        label: string;
        url: string;
        adminOnly: string;
        shouldFetch: string;
        localUrl: string;
        update: string;
      };
    };
    users: {
      title: string;
      confirmDelete: string;
      deleted: (username: string) => string;
    };
    logs: {
      title: string;
    };
  };
  modal: {
    yes: string;
    no: string;
    warnIrreversible: string;
  };
  projects: {
    title: string;
  };
  liveSeries: {
    title: string;
    whatsThis: string;
    explanation: string;
    cta: string;
    setup: string;
    tvShowList: {
      showing: string;
      of: string;
      page: string;
      next: string;
      previous: string;
    };
    tvShow: {
      title: string;
      unknown: string;
      present: string;
      source: string;
      images: string;
      previousImage: string;
      nextImage: string;
      episodes: string;
      noEpisodes: string;
      episode: string;
      season: string;
      like: string;
      unlike: string;
      subscribe: string;
      unsubscribe: string;
      confirmSubscribe: string;
      unwatchedEpisodes: (unwatched: number) => string;
      showDetails: string;
      markWatched: (un: string) => string;
      markAllWatched: (un: string) => string;
      un: string;
      unwatched: string;
    };
    search: {
      title: string;
      label: string;
      labelShort: string;
      prompt: string;
      search: string;
      searching: string;
      cancel: string;
      results: string;
      noResults: string;
    };
    home: {
      title: string;
      likedShows: string;
      noLikes: string;
      explore: string;
      shows: string;
      login: string;
      noUnwatched: string;
    };
    mostPopular: {
      title: string;
    };
    episodes: {
      downloadStatus: Record<DownloadedEpisode["status"], string>;
      downloadComplete: (episode: string) => string;
      downloadError: (episode: string) => string;
      confirmDelete: (episode: string) => string;
      deleted: (episode: string) => string;
      serialise: (episode: Pick<TvMazeEpisode, "number" | "season">) => string;
    };
    watch: {
      playbackError: string;
      previous: string;
      next: string;
    };
    websockets: {
      connectionFailed: string;
      error: string;
      askReconnect: string;
    };
  };
  error: {
    [code in ErrorCode]: {
      title: string;
      body: string;
    };
  };
}>;

export const TRANSLATIONS: { [lang in Language]: Translation } = {
  EN: ENGLISH,
  PL: POLISH,
};

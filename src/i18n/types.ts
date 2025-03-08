import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";

import type { ErrorCode } from "@/lib/enums";
import type { DownloadedEpisode } from "@/lib/types";

export type Formatters = {
  quote: (text: string) => string;
  serialiseEpisode: (episode: Pick<TvMazeEpisode, "season" | "number">) => string;
};

export type Translation = Readonly<{
  loading: string;
  redirecting: string;
  language: string;
  loginShort: string;
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
    serverUrlUpdated: string;
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
        info: string;
        cta: string;
        success: string;
      };
      forgotPassword: {
        header: string;
        info: string;
        success: string;
      };
      resetPassword: {
        header: string;
        field: string;
        submit: string;
        success: string;
      };
      delete: {
        label: string;
        confirmation: string;
        currentUser: string;
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
      deleted: string;
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
    download: string;
    gallery: string;
    visit: string;
    by: string;
    myGithub: string;
  };
  liveSeries: {
    title: string;
    seoTitle: string;
    description: string;
    whatsThis: string;
    explanation: string;
    cta: string;
    setup: string;
    tvMazeCredits: string;
    tvMazeCreditsCta: string;
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
      unwatchedEpisodes: string;
      showDetails: string;
      markWatched: string;
      markAllWatched: string;
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
      downloadComplete: string;
      downloadError: string;
      confirmDelete: string;
      deleted: string;
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

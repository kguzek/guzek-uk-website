import type { Translation } from ".";
import {
  LIVESERIES_SERVER_HOMEPAGE,
  LONG_DATE_FORMAT,
  SHORT_DATE_FORMAT,
  SHORT_TIME_FORMAT,
} from "./common";

export const ENGLISH: Translation = {
  footer: (year) => `${year} \u00a9 Konrad Guzek`,
  loading: "Loading",
  redirecting: "Redirecting",
  language: "Language",
  loginShort: "Log in",
  dateFormat: new Intl.DateTimeFormat("en-GB", LONG_DATE_FORMAT),
  dateShortFormat: new Intl.DateTimeFormat("en-GB", SHORT_DATE_FORMAT),
  dateTimeFormat: new Intl.DateTimeFormat("en-GB", {
    ...LONG_DATE_FORMAT,
    ...SHORT_TIME_FORMAT,
  }),
  dateTimeShortFormat: new Intl.DateTimeFormat("en-GB", {
    ...SHORT_DATE_FORMAT,
    ...SHORT_TIME_FORMAT,
  }),
  numberFormat: new Intl.NumberFormat("en-GB"),
  networkError:
    "A network error occurred while performing this action. Please try again later.",
  unknownError: "An unknown error occured. Please contact konrad@guzek.uk",
  loggedOut: "You have been logged out.",
  placeholder: {
    email: "john@doe.co.uk",
    username: "johndoe",
  },
  profile: {
    title: "Profile",
    body: "Welcome to your profile!",
    loading: "Validating",
    invalidCredentials: "Invalid credentials.",
    passwordMismatch: "Passwords do not match.",
    passwordLength: "Password must be at least 8 characters long.",
    serverUrlUpdated: (url) => `LiveSeries Server URL successfully updated to ${url}`,
    formDetails: {
      username: "Username",
      email: "Email",
      loginPrompt: "Username or email",
      creationDate: "Account creation date",
      type: "Account type",
      administrator: "administrator",
      regularUser: "regular user",
      password: "Password",
      passwordRepeat: "Repeat password",
      login: "Log In",
      signup: "Sign Up",
      or: "or",
      haveAccountAlready: "have an account already?",
      logout: "Log out",
      serverUrl: "LiveSeries Server URL",
      verifyEmail: {
        header: "Email Verification",
        info: (email) =>
          `An email has been sent to ${email || "your address"} with a verification link.`,
        cta: "Please check your inbox.",
        success: "Email verified successfully",
      },
      forgotPassword: {
        header: "Forgot password",
        info: (email) =>
          `If there is an account registered to ${email || "that address"}, it will be sent an email with a password reset link.`,
        success: "An email with a password reset link has been sent.",
      },
      resetPassword: {
        header: "Password Reset",
        field: "New password",
        submit: "Reset password",
        success: "Password reset successfully",
      },
    },
  },
  error: {
    400: {
      title: "Bad Request",
      body: "The request was invalid",
    },
    401: {
      title: "Unauthorized",
      body: "This page is only available to logged in users",
    },
    403: {
      title: "Forbidden",
      body: "You do not have permission to view this resource",
    },
    404: {
      title: "Not Found",
      body: "The requested resource was not found",
    },
    500: {
      title: "Server Error",
      body: "An error occurred while processing your request",
    },
  },
  admin: {
    title: "Admin Tools",
    contentManager: {
      title: "Content Manager",
      selectedPage: "Selected page",
      addPage: "Create page",
      formDetails: {
        title: "Title",
        label: "Label",
        url: "URL",
        adminOnly: "Admin only",
        localUrl: "Dynamic",
        shouldFetch: "Custom contents",
        update: "Update",
      },
    },
    users: {
      title: "Users",
      confirmDelete: "Are you sure you want to delete this user?",
      deleted: (username) => `User ${username} has been deleted.`,
    },
    logs: {
      title: "Logs",
    },
  },
  modal: {
    yes: "Yes",
    no: "No",
  },
  projects: {
    title: "Projects",
  },
  liveSeries: {
    title: "LiveSeries",
    whatsThis: "What's this?",
    explanation: `In order to search for and download TV show torrents, you must set up a LiveSeries server. This server will be used to fetch torrent files and stream video content. Find out more at ${LIVESERIES_SERVER_HOMEPAGE}`,
    tvShowList: {
      showing: "Showing",
      of: "of",
      page: "Page",
      previous: "Previous",
      next: "Next",
    },
    tvShow: {
      title: "Show Details",
      unknown: "Unknown",
      present: "Present",
      source: "Source",
      images: "Gallery",
      previousImage: "Previous image",
      nextImage: "Next image",
      episodes: "Episodes",
      noEpisodes: "No episodes to list.",
      episode: "Episode",
      season: "Season",
      like: "Like",
      unlike: "Unlike",
      subscribe: "Subscribe to automatic downloads",
      confirmSubscribe: (unwatched) =>
        `Warning: Are you sure you want to automatically download unwatched episodes for this show? You have ${unwatched} unwatched episodes.`,
      showDetails: "Show Details",
      markWatched: (un) => `Mark episode as ${un}watched`,
      markAllWatched: (un) => `Mark all episodes in season as ${un}watched`,
      un: "un",
      unwatched: "Unwatched",
    },
    search: {
      title: "Search",
      label: "Search TV Shows",
      prompt: "What would you like to watch?",
      search: "Search",
      searching: "Searching",
      cancel: "Cancel",
      results: "Results for",
      noResults: "Your query returned no results. Try searching for something else.",
    },
    home: {
      title: "Home",
      likedShows: "Your Liked Shows",
      noLikes:
        "Welcome to LiveSeries! To get started, find a show to watch. \n\
Use the search bar to find your favourite TV shows, or explore the most popular ones. \n\
Once you find a show you like, click the heart icon to add it to your liked shows—you will then find it here!",
      explore: "Explore",
      shows: "Shows",
      login: "You must be logged in to use that function.",
      noUnwatched: "You're all up-to-date!",
    },
    mostPopular: {
      title: "Most Popular",
    },
    episodes: {
      downloadStatus: {
        1: "Download",
        2: "Downloading",
        3: "Watch",
        4: "Download failed",
        5: "Unknown status",
        6: "Verifying",
      },
      downloadComplete: (episode) => `${episode} has finished downloading.`,
      downloadError: (episode) => `${episode} download has failed.`,
      confirmDelete: (episode) =>
        `Are you sure you want to delete ${episode} from the server?`,
      deleted: (episode) => `Episode ${episode} was successfully deleted.`,
      serialise: (episode) =>
        `S${episode.season.toString().padStart(2, "0")}E${episode.episode
          .toString()
          .padStart(2, "0")}`,
    },
    watch: {
      playbackError: "There was a problem playing that video. Please try again later.",
      previous: "Previous",
      next: "Next",
    },
    websockets: {
      connectionFailed:
        "Could not establish a connection with the websocket. Ensure the LiveSeries server URL is configured correctly and try again later.",
      error: "An unknown error occured during websocket communication. Try again later.",
      askReconnect:
        "The websocket connection with the LiveSeries server was forcefully closed. Reconnect?",
    },
  },
};

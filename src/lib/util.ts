import {
  getFetchFromAPI,
  clearStoredLoginInfo,
  updateAccessToken,
} from "./backend";
import { Language } from "./enums";
import type { Episode, User, DownloadedEpisode, TryFetch } from "./types";
import { Translation } from "./translations";
import Cookies from "universal-cookie";

export const PAGE_NAME = "Guzek UK";

const USER_REQUIRED_PROPERTIES = [
  "uuid",
  "username",
  "email",
  "admin",
  "serverUrl",
  "created_at",
  "modified_at",
];

export function getTitle(
  title?: string,
  suffix: string | null = null,
  addPageName = true,
) {
  if (!title) return PAGE_NAME;
  const withSuffix = `${title}${suffix ? ` – ${suffix}` : ""}`;
  return addPageName ? `${withSuffix} | ${PAGE_NAME}` : withSuffix;
}

export const setTitle = (title: string) =>
  void (document.title = getTitle(title));

export const getTryFetch = (
  fetchFromAPI: ReturnType<typeof getFetchFromAPI>,
  setModalError: (message: string | undefined) => void,
  data: Translation,
): TryFetch =>
  /** Attempts to fetch the data from local cache or from the API.
   *  On success, returns the consumed response's body.
   *  On failure, returns `defaultData`.
   */
  async function tryFetch<T>(
    path: string,
    params: Record<string, string>,
    defaultData: T,
    useCache: boolean = true,
  ) {
    let res;
    try {
      res = await fetchFromAPI(path, { params }, useCache);
    } catch (networkError) {
      console.error("Could not fetch from API:", networkError);
      setModalError(data.networkError);
      return defaultData;
    }
    const json = await res?.json();
    if (res?.ok) return json as T;
    setModalError(getErrorMessage(res, json, data));
    return defaultData;
  };

const divmod = (dividend: number, divisor: number) => [
  Math.floor(dividend / divisor),
  dividend % divisor,
];

/** Converts a duration in milliseconds to duration object. */
export function getDuration(milliseconds: number) {
  let seconds, minutes, hours, days;
  [seconds, milliseconds] = divmod(milliseconds, 1000);
  [minutes, seconds] = divmod(seconds, 60);
  [hours, minutes] = divmod(minutes, 60);
  [days, hours] = divmod(hours, 24);
  let formatted = "";
  if (days) formatted += ` ${days}d`;
  if (hours) formatted += ` ${hours}h`;
  if (!days && minutes) formatted += ` ${minutes}m`;
  if (!days && !hours && seconds) formatted += ` ${seconds}s`;
  formatted = formatted.trim();
  return { formatted, days, hours, minutes, seconds, milliseconds };
}

export function scrollToElement(
  selector: string,
  inline: ScrollLogicalPosition = "center",
) {
  document.querySelector(selector)?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline,
  });
}

export const isInvalidDate = (date: Date) => date.toString() === "Invalid Date";

export const getEpisodeAirDate = (episode: Episode, addSpace = false): Date => {
  // This is needed in order to interpret the `air_date` as a date given in UTC+0
  const correctedDateString = episode.air_date + (addSpace ? " Z" : "Z");
  const correctedDate = new Date(correctedDateString);
  if (isInvalidDate(correctedDate)) {
    if (addSpace) console.warn(episode.air_date);
    else return getEpisodeAirDate(episode, true);
  }
  return correctedDate;
};

export const hasEpisodeAired = (episode: Episode) =>
  new Date() > getEpisodeAirDate(episode);

const STATUS_CODES: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  206: "Partial Content",
  400: "Bad Request",
  401: "Unauthorised",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  429: "Too Many Requests",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

/** Formats the response's JSON body into a user-readable error message, with a fallback to simply displaying the JSON,
 * with another fallback to displaying a generic error message in the user's language. */
export const getErrorMessage = (
  res: Response,
  json: any,
  data: Translation,
): string =>
  (json[`${res.status} ${STATUS_CODES[res.status] || res.statusText}`] ??
    JSON.stringify(json)) ||
  data.unknownError;

export const getUTCDateString = (dateInit: any) =>
  new Date(dateInit).toISOString().split("T")[0];

export function getUserFromResponse(json: any) {
  const { accessToken, refreshToken, expiresAt, ...userDetails } = json;
  updateAccessToken(accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  return userDetails as User;
}

function rejectSavedUser(user: any) {
  console.warn(
    "Cleared fake user set in localStorage. If you're reading this, nice try!",
    user,
  );
  clearStoredLoginInfo();
}

export function getLocalUser() {
  const savedUser = localStorage.getItem("user");
  if (!savedUser) return;
  let parsedUser;
  try {
    parsedUser = JSON.parse(savedUser);
  } catch {
    return clearStoredLoginInfo();
  }
  if (!parsedUser) return clearStoredLoginInfo();
  for (const property of USER_REQUIRED_PROPERTIES) {
    if (parsedUser[property] !== undefined) continue;
    return rejectSavedUser(parsedUser);
  }
  if (
    Object.keys(parsedUser).length !==
    Object.keys(USER_REQUIRED_PROPERTIES).length
  ) {
    return rejectSavedUser(parsedUser);
  }
  for (const dateString of [parsedUser.created_at, parsedUser.modified_at]) {
    if (isInvalidDate(new Date(dateString))) return rejectSavedUser(parsedUser);
  }
  return parsedUser as User;
}

const UNIT_PREFIXES = ["", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi", "Yi"];

/** Converts a value in bytes to a human-readable form. E.g. (4096) => "4.00 KiB" */
export function bytesToReadable(value: number) {
  const result = _bytesToReadable(value);
  //console.debug(value, '->', result);
  return result;
}

function _bytesToReadable(value: number) {
  const exponent = Math.floor(Math.log2(value) / 10);
  const unitPrefix = UNIT_PREFIXES[exponent];
  if (!unitPrefix) return `${value} B`;
  const divisor = Math.pow(1024, exponent);
  return `${(value / divisor).toFixed(1)} ${unitPrefix}B`;
}

type EpisodeLike = Pick<DownloadedEpisode, "showName" | "season" | "episode">;

/** Returns true if `a` and `b` reference the same episode. */
export const compareEpisodes = (a: EpisodeLike, b: EpisodeLike) =>
  a.showName === b.showName && a.season === b.season && a.episode === b.episode;

export function setLanguageCookie(langString: string) {
  if (!(langString in Language)) {
    throw new Error("Invalid language name.");
  }
  const language = Language[langString as keyof typeof Language];
  const cookies = new Cookies();
  cookies.set("lang", langString, {
    httpOnly: false,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    path: "/",
    sameSite: "lax",
  });
  return language;
}

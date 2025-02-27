import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import Cookies from "js-cookie";

import type { ApiMessage, ErrorResponseBody, ErrorResponseMultiple } from "@/lib/types";
import type { Media } from "@/payload-types";

import type { Translation } from "./translations";
import type { DownloadedEpisode } from "./types";
import { Language } from "./enums";

const PRODUCTION_MODE = process.env.NODE_ENV !== "development";

export const PAGE_NAME = "Guzek UK";

export function getTitle(
  title?: string,
  suffix: string | null = null,
  addPageName = true,
) {
  if (!title) return PAGE_NAME;
  const withSuffix = `${title}${suffix ? ` – ${suffix}` : ""}`;
  return addPageName ? `${withSuffix} | ${PAGE_NAME}` : withSuffix;
}

export const setTitle = (title: string) => void (document.title = getTitle(title));

const divmod = (dividend: number, divisor: number) => [
  Math.floor(dividend / divisor),
  dividend % divisor,
];

/** Converts a duration in milliseconds to duration object. */
export function getDuration(milliseconds: number) {
  let seconds, minutes, hours;
  [seconds, milliseconds] = divmod(milliseconds, 1000);
  [minutes, seconds] = divmod(seconds, 60);
  [hours, minutes] = divmod(minutes, 60);
  const [days, hoursRemainder] = divmod(hours, 24);
  hours = hoursRemainder;
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

export const isNumber = (value: string): value is `${number}` =>
  (+value).toString() === value;

export const getEpisodeAirDate = (episode: TvMazeEpisode) => new Date(episode.airstamp);

export const hasEpisodeAired = (episode: TvMazeEpisode) =>
  new Date() > getEpisodeAirDate(episode);

const STATUS_CODES: { [code in number]?: string } = {
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

const isErrorSingle = (json: ErrorResponseBody): json is ApiMessage =>
  "message" in json && json.message != null;

const isErrorMultiple = (json: ErrorResponseBody): json is ErrorResponseMultiple =>
  "errors" in json &&
  Array.isArray(json.errors) &&
  json.errors.every((error) => "message" in error);

const mapErrorMultiple = (json?: ErrorResponseMultiple): string[] =>
  json == null
    ? []
    : json.errors.flatMap(({ message, data }) =>
        [message == null ? [] : [message], mapErrorMultiple(data)].flat(),
      );

/** Formats the response's JSON body into a user-readable error message, with a fallback to simply displaying the JSON,
 * with another fallback to displaying a generic error message in the user's language. */
export const getErrorMessage = (
  res: Response,
  json: ErrorResponseBody,
  data: Translation,
): string =>
  (json == null
    ? data.unknownError
    : isErrorSingle(json)
      ? json.message
      : isErrorMultiple(json)
        ? mapErrorMultiple(json).join("\n")
        : (json[`${res.status} ${STATUS_CODES[res.status] ?? res.statusText}`] ??
          JSON.stringify(json))) || data.unknownError;

export const getUTCDateString = (...dateInit: ConstructorParameters<typeof Date>) =>
  new Date(...dateInit).toISOString().split("T")[0];

const UNIT_PREFIXES = ["", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi", "Yi"];

/** Converts a value in bytes to a human-readable form. E.g. (4096) => "4.00 KiB" */
export function bytesToReadable(value: number) {
  const result = _bytesToReadable(value);
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

export const getLanguageCookieOptions = () =>
  ({
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    path: "/",
    sameSite: "lax",
    domain: PRODUCTION_MODE ? ".guzek.uk" : undefined,
    secure: PRODUCTION_MODE,
  }) as const;

export function setLanguageCookie(langString: string) {
  if (!(langString in Language)) {
    throw new Error("Invalid language name.");
  }
  const language = Language[langString as keyof typeof Language];
  Cookies.set("lang", langString, getLanguageCookieOptions());
  console.debug("Set language cookie to", langString);
  return language;
}

export function randomElement<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function isScriptUrl(url: string | null | undefined) {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return !!trimmed.match(/^(?:javascript|data|vbscript):/);
}

export function sanitiseUrl(url: string) {
  if (isScriptUrl(url)) return "";
  return url;
}

type MediaImage = Pick<Media, "id" | "createdAt" | "updatedAt" | "alt"> & {
  url: string;
  width: number;
  height: number;
};

export const isImage = (image: Media | number): image is MediaImage =>
  typeof image !== "number" && !!image.url && !!image.width && !!image.height;

export function addOrRemove<T>(items: T[] | null | undefined, item: T, add: boolean) {
  const nonNullItems = items ?? [];
  const filtered = add
    ? [...nonNullItems, item]
    : nonNullItems.filter((id) => id !== item);
  return ensureUnique([0, ...filtered]);
}

export const ensureUnique = <T>(items: T[]) => [...new Set(items)];

import { useEffect, useState } from "react";
import {
  clearStoredLoginInfo,
  FetchFromAPI,
  updateAccessToken,
} from "./backend";
import { Episode, StateSetter, User } from "./models";
import { Translation } from "./translations";

export const PAGE_NAME = "Guzek UK";

const USER_REQUIRED_PROPERTIES = [
  "uuid",
  "username",
  "email",
  "admin",
  "created_at",
  "modified_at",
];

export const setTitle = (title: string) =>
  (document.title = `${title} | ${PAGE_NAME}`);

export type TryFetch = <T>(
  path: string,
  params: Record<string, string>,
  defaultData: T,
  useCache?: boolean
) => Promise<T>;

export const getTryFetch = (
  fetchFromAPI: FetchFromAPI,
  setModalError: StateSetter<string | undefined>,
  data: Translation
): TryFetch =>
  /** Attempts to fetch the data from local cache or from the API.
   *  On success, returns the consumed response's body.
   *  On failure, returns `defaultData`.
   */
  async function tryFetch<T>(
    path: string,
    params: Record<string, string>,
    defaultData: T,
    useCache: boolean = true
  ) {
    let res;
    try {
      res = await fetchFromAPI(path, { params }, useCache);
    } catch (networkError) {
      console.error("Could not fetch from API:", networkError);
      setModalError(data.networkError);
      return defaultData;
    }
    const json = await res.json();
    if (res.ok) return json as T;
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
  const formatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  return { formatted, days, hours, minutes, seconds, milliseconds };
}

export function useScroll(element: Element | null) {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    if (!element) return;
    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [element]);

  function handleScroll(scrollEvent: Event) {
    const elem = scrollEvent.target as Element | null;
    setScroll(elem?.scrollLeft ?? 0);
  }

  return { scroll };
}

export function scrollToElement(
  selector: string,
  inline: ScrollLogicalPosition = "center"
) {
  document.querySelector(selector)?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline,
  });
}

export const isInvalidDate = (date: Date) => date.toString() === "Invalid Date";

export const getEpisodeAirDate = (episode: Episode) => {
  // This is needed in order to interpret the `air_date` as a date given in UTC+0
  const correctedDateString = new Date(episode.air_date + " Z");
  const correctedDate = new Date(correctedDateString);
  if (isInvalidDate(correctedDate)) console.warn(episode.air_date);
  return correctedDate;
};

export const hasEpisodeAired = (episode: Episode) =>
  new Date() > getEpisodeAirDate(episode);

export const getErrorMessage = (res: Response, json: any, data: Translation) =>
  (json[`${res.status} ${res.statusText}`] ?? JSON.stringify(json)) ||
  data.unknownError;

export function getUserFromResponse(json: any) {
  const { accessToken, refreshToken, expiersAt, ...userDetails } = json;
  updateAccessToken(accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  return userDetails as User;
}

function rejectSavedUser() {
  console.warn(
    "Cleared fake user set in localStorage. If you're reading this, nice try!"
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
    return rejectSavedUser();
  }
  if (
    Object.keys(parsedUser).length !==
    Object.keys(USER_REQUIRED_PROPERTIES).length
  ) {
    return rejectSavedUser();
  }
  for (const dateString of [parsedUser.created_at, parsedUser.modified_at]) {
    if (isInvalidDate(new Date(dateString))) return rejectSavedUser();
  }
  return parsedUser as User;
}

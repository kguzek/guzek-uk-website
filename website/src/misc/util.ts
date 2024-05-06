import { fetchFromAPI } from "./backend";
import { PageContent, StateSetter, User } from "./models";

export const PAGE_NAME = "Guzek UK";

const DEFAULT_PAGE_DATA: PageContent = {
  content: "Oops! This page hasn't been implemented yet.",
};

export const setTitle = (title: string) =>
  (document.title = `${title} | ${PAGE_NAME}`);

/** Attempts to fetch the data from local cache or from the API.
 *  On success, returns the consumed response's body.
 *  On failure, returns `defaultData`.
 */
export async function tryFetch<T>(
  path: string,
  params: Record<string, string>,
  defaultData: T,
  logout: () => void,
  useCache: boolean = true
) {
  let res;
  try {
    res = await fetchFromAPI(path, { params }, logout, useCache);
  } catch (networkError) {
    console.error("Could not fetch from API:", networkError);
    return defaultData;
  }
  const json: T = await res.json();
  if (res.ok) return json;
  console.error("Invalid response from API:", json);
  return defaultData;
}

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

export async function fetchPageContent(
  id: number,
  lang: string,
  setContent: (pageContent: PageContent) => void,
  logout: () => void
) {
  const url = `pages/${id}`;
  const body = await tryFetch(url, { lang }, DEFAULT_PAGE_DATA, logout);
  setContent(body);
}

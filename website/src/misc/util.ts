import { useEffect, useState } from "react";
import { fetchFromAPI } from "./backend";
import { Episode, PageContent, StateSetter, User } from "./models";

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

export function useScroll(selector: string) {
  const [scroll, setScroll] = useState(0);
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    const elem = document.querySelector(selector);
    if (!elem) throw Error("Invalid selector " + selector);
    setElement(elem);
    elem.addEventListener("scroll", handleScroll, { passive: true });
    return () => elem.removeEventListener("scroll", handleScroll);
  }, []);

  function handleScroll(scrollEvent: Event) {
    const elem = scrollEvent.target as Element;
    setScroll(elem.scrollLeft ?? 0);
  }

  return {
    scroll,
    totalWidth: element?.scrollWidth ?? 0,
    visibleWidth: (element as HTMLElement | null)?.offsetWidth ?? 0,
  };
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

export const hasEpisodeAired = (episode: Episode) =>
  new Date() > new Date(episode.air_date);

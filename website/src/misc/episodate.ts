import { getSearchParams } from "./backend";

const API_BASE = "https://www.episodate.com/api/";

export function fetchFromEpisodate(
  endpoint: string,
  params?: Record<string, string> | URLSearchParams
) {
  const url = API_BASE + endpoint + getSearchParams(params);
  const request = new Request(url);
  // Episodate API allows direct fetching for applications with low traffic
  // return fetchWithCache(request);
  return fetch(request);
}


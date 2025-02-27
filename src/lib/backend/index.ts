import type { User } from "@/payload-types";

import type { ApiMessage } from "../types";
import { getResponse } from "./error-handling";

const SANDWICHED_JSON_PATTERN = /.*?(\{.*\}).*?/;

export function parseResponseBody(body: string) {
  try {
    return JSON.parse(body);
  } catch {
    console.warn("Initial body JSON parse failed:", body);
  }
  const sandwichedMatch = body.match(SANDWICHED_JSON_PATTERN);
  if (sandwichedMatch == null) {
    console.warn("No sandwiched JSON found in body");
  } else {
    body = sandwichedMatch[1];
  }
  for (let offset = 0; offset < body.length / 2; offset++) {
    try {
      return JSON.parse(body.substring(offset, body.length - offset));
    } catch {
      console.debug("Failed to parse JSON with offset", offset);
    }
  }
  for (let start = 0; start < body.length; start++) {
    for (let end = body.length; end > start; end--) {
      try {
        return JSON.parse(body.substring(start, end));
      } catch {
        console.debug("Failed to parse JSON with start", start, "and end", end);
      }
    }
  }
  throw new Error("No substring of the body yields valid JSON.");
}

/** Formats a key-value dictionary into a string ready for use in a URL.
 *
 * @param params The key-value dictionary to format. Can be a `URLSearchParams` object, or an object (empty or not).
 * @returns The formatted search query string starting with '?, or an empty string if no parameters are provided.
 */
function getSearchParams(params: Record<string, string> | URLSearchParams = {}) {
  const searchParams =
    params instanceof URLSearchParams ? params : new URLSearchParams(params);
  if ([...searchParams.keys()].length === 0) return "";
  return `?${searchParams}`;
}

type BodyFetchOptions = {
  method: "POST" | "PUT" | "PATCH";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: { [key: string]: any } | any[];
};

type BodilessFetchOptions = {
  method?: "GET" | "DELETE" | "POST";
  body?: never;
};
export type FetchOptions = (BodyFetchOptions | BodilessFetchOptions) & {
  params?: Record<string, string>;
  headers?: Record<string, string>;
  accessToken?: string | null;
  urlBase?: string;
};

/** This ensures the path is no longer than two subdirectories.
 *
 * @param path The path to shorten.
 * @returns The shortened path, containing at most one separator (slash).
 *
 * @example pathToTag("a/b/c") => "a/b"
 * @example pathToTag("a") => "a"
 */
export function pathToTag(path: string) {
  const parts = path.split("/");
  if (parts.length < 2) return path;
  return parts.slice(0, 2).join("/");
}

export async function fetchFromApi<T>(
  path: string,
  { accessToken, ...fetchOptions }: FetchOptions = {},
) {
  const requestInit: RequestInit = {
    method: fetchOptions.method,
    credentials: "include",
    next: {
      tags:
        fetchOptions.method == null || fetchOptions.method === "GET"
          ? [pathToTag(path)]
          : [],
    },
  };
  const headers: HeadersInit = {
    Accept: "application/json",
    ...fetchOptions.headers,
  };
  if (accessToken != null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (fetchOptions.body != null) {
    requestInit.body = JSON.stringify(fetchOptions.body);
    headers["Content-Type"] = "application/json";
  } else if (fetchOptions.method === "POST") {
    // Apparently POST requests with no body should specify Content-Length: 0, to prevent problems when using proxies.
    // https://stackoverflow.com/a/4198969
    headers["Content-Length"] = "0";
  }
  requestInit.headers = headers;
  const prefix = fetchOptions.urlBase ?? `${process.env.WEBSITE_URL ?? ""}/api/`;
  const url = `${prefix}${path}${getSearchParams(fetchOptions.params)}`;
  return getResponse<T>(url, requestInit);
}

export async function refreshAccessToken(accessToken?: string) {
  const result = await fetchFromApi<
    ApiMessage & { refreshedToken: string; exp: number; user: User }
  >("users/refresh-token", {
    method: "POST",
    headers:
      accessToken == null
        ? undefined
        : {
            Authorization: `Bearer ${accessToken}`,
          },
  });
  console.info("Access token refreshed", result.data.exp);
  return result;
}

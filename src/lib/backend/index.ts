import { User } from "../types";

const USE_LOCAL_API_URL = false;
// const USE_LOCAL_API_URL = true;

const useLocalUrl = process.env.NODE_ENV === "development" && USE_LOCAL_API_URL;

export const API_BASE = useLocalUrl
  ? "http://localhost:5017/"
  : "https://api.guzek.uk/";

const API_BASE_AUTH = useLocalUrl
  ? "http://localhost:5019/"
  : "https://auth.guzek.uk/";

const API_BASE_LIVESERIES_LOCAL = "http://localhost:5021/";

const DECENTRALISED_ROUTES = [
  "liveseries/downloaded-episodes",
  "liveseries/subtitles",
  "liveseries/video",
  "torrents",
];

export type ErrorResponseBody = { [code: string]: string };

const SANDWICHED_JSON_PATTERN = /.*?(\{.*\}).*?/;

function parseResponseBody(body: string) {
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
    } catch {}
  }
  for (let start = 0; start < body.length; start++) {
    for (let end = body.length; end > start; end--) {
      try {
        return JSON.parse(body.substring(start, end));
      } catch {}
    }
  }
  throw new Error("No substring of the body yields valid JSON.");
}

/** Formats a key-value dictionary into a string ready for use in a URL.
 *
 * @param params The key-value dictionary to format. Can be a `URLSearchParams` object, or an object (empty or not).
 * @returns The formatted search query string starting with '?, or an empty string if no parameters are provided.
 */
export function getSearchParams(
  params: Record<string, string> | URLSearchParams = {},
) {
  const searchParams =
    params instanceof URLSearchParams ? params : new URLSearchParams(params);
  if ([...searchParams.keys()].length === 0) return "";
  return `?${searchParams}`;
}

export function getUrlBase(path: string, user: User | null) {
  if (DECENTRALISED_ROUTES.some((route) => path.startsWith(route))) {
    if (!user?.serverUrl) {
      console.error("No server URL available for decentralised route:", path);
      return API_BASE_LIVESERIES_LOCAL;
    }
    return user.serverUrl;
  }
  if (path.startsWith("auth/")) {
    return API_BASE_AUTH;
  }
  return API_BASE;
}

type BodyFetchOptions = {
  method: "POST" | "PUT" | "PATCH";
  body: Record<string, any>;
};

type BodilessFetchOptions = {
  method?: "GET" | "DELETE" | "POST";
  body?: never;
};
export type BaseFetchOptions = (BodyFetchOptions | BodilessFetchOptions) & {
  params?: Record<string, string>;
  headers?: Record<string, string>;
};

export type ClientFetchOptions = BaseFetchOptions;

export type ServerFetchOptions = BaseFetchOptions & {
  api?: "episodate";
};

type FetchOptions = ClientFetchOptions | ServerFetchOptions;

export async function prepareRequest(
  path: string,
  fetchOptions: FetchOptions,
  accessToken: string | null,
  useCredentials?: boolean,
): Promise<RequestInit & { next: NextFetchRequestConfig }> {
  useCredentials ??= accessToken != null;
  const requestInit: RequestInit = {
    method: fetchOptions.method,
  };
  const headers: HeadersInit = {
    Accept: "application/json",
    ...fetchOptions.headers,
  };
  if (useCredentials && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (fetchOptions.body) {
    requestInit.body = JSON.stringify(fetchOptions.body);
    headers["Content-Type"] = "application/json";
  } else if (fetchOptions.method === "POST") {
    // Apparently POST requests with no body should specify Content-Length: 0, to prevent problems when using proxies.
    // https://stackoverflow.com/a/4198969
    headers["Content-Length"] = "0";
  }
  return {
    ...requestInit,
    headers,
    next: {
      tags:
        fetchOptions.method == null || fetchOptions.method === "GET"
          ? [pathToTag(path)]
          : [],
    },
  };
}

export async function fetchFromApi<T>(url: string, options: RequestInit) {
  const method = options.method ?? "GET";
  let res;
  try {
    res = await fetch(url, options);
  } catch (error) {
    console.error(method, url, "FAILED:", error);
    return {
      failed: true,
      res: null,
      hasBody: false,
      ok: false,
      data: null,
      error: null,
    } as const;
  }
  let body: string;
  try {
    body = await res.text();
  } catch {
    console.error(
      "FAILED to read response body from",
      method,
      url,
      "with status:",
      res.status,
      res.statusText,
    );
    return {
      failed: false,
      res,
      hasBody: false,
      ok: false,
      data: null,
      error: null,
    } as const;
  }
  let data: T;
  if (res.headers.get("Content-Type")?.includes("application/json")) {
    try {
      // Use this method because sometimes res.json() fails with weird errors
      data = parseResponseBody(body.trim());
    } catch (error) {
      console.error(
        "FAILED to parse JSON from",
        method,
        url,
        "with status:",
        res.status,
        res.statusText,
        error,
        "and response body:",
        body,
      );
      return {
        failed: false,
        res,
        hasBody: false,
        ok: false,
        data: null,
        error: null,
      } as const;
    }
  } else {
    console.warn("Non-JSON response received, proceeding");
    data = body as T;
  }

  // console.debug("...", res.status, res.statusText);
  if (res.ok) {
    return {
      failed: false,
      res,
      hasBody: true,
      ok: true,
      data,
      error: null,
    } as const;
  }
  return {
    failed: false,
    res,
    hasBody: true,
    ok: false,
    data: null,
    error: data as ErrorResponseBody,
  } as const;
}

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

/** Makes a request to the Next server to revalidate the tag corresponding to the path, and logs a message on failure. */
export async function triggerRevalidation(path: string) {
  const url = "/api/revalidate";
  const tag = pathToTag(path);
  const request = await prepareRequest(
    url,
    { method: "POST", body: { tag } },
    null,
  );
  const result = await fetchFromApi(url, request);
  if (!result.ok) {
    console.warn(
      "Failed to trigger revalidation for tag",
      tag,
      result.error ?? "",
    );
  }
  return result;
}

import { User } from "../types";

// const USE_LOCAL_API_URL = false;
const USE_LOCAL_API_URL = true;

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
const JSON_PATTERN =
  /(\{(?:[^{}[\]]|(?<rec1>\{(?:[^{}[\]]|<rec1>)*\}))*\}|\[(?:[^\[\]{}]|(?<rec2>\[(?:[^\[\]{}]|<rec2>)*\]))*\])/g;

function parseResponseBody(body: string) {
  try {
    return JSON.parse(body);
  } catch {
    console.warn("Initial body JSON parse failed:", body);
  }
  const matches = [...body.matchAll(JSON_PATTERN)].map((match) => match[0]);
  matches.length;
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

export type BaseFetchOptions = {
  params?: Record<string, string>;
};

type BodyFetchOptions = {
  method: "POST" | "PUT" | "PATCH";
  body: Record<string, any>;
};

type BodilessFetchOptions = {
  method?: "GET" | "DELETE" | "POST";
  body?: never;
};

export type ClientFetchOptions = BaseFetchOptions & BodyFetchOptions;

export type ServerFetchOptions = BaseFetchOptions & {
  api?: "episodate";
} & (BodyFetchOptions | BodilessFetchOptions);

type FetchOptions = ClientFetchOptions | ServerFetchOptions;

type GetAccessToken = { getAccessToken: () => Promise<string | null> };

type AuthOptions =
  | { accessToken: string; getAccessToken?: never }
  | (GetAccessToken & { accessToken?: never });

const requestNeedsCredentials = (
  path: string,
  method: FetchOptions["method"],
) =>
  (method === "POST" || method === "DELETE") &&
  ["auth/tokens", "auth/refresh", "auth/users"].includes(path);

export async function prepareRequest(
  path: string,
  fetchOptions: FetchOptions,
  ...args: [false, GetAccessToken | null | never] | [true, AuthOptions]
): Promise<RequestInit & { next: NextFetchRequestConfig }> {
  const [useAuth, authOptions] = args;
  const requestInit: RequestInit = {
    method: fetchOptions.method,
    credentials: requestNeedsCredentials(path, fetchOptions.method)
      ? "include"
      : "omit",
  };
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (useAuth) {
    const { getAccessToken, accessToken } = authOptions;
    const token = accessToken ?? (await getAccessToken());
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
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
          ? [path]
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
    console.error(method, url, "FALIED:", error);
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

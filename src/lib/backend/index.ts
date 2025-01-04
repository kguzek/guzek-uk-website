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

type BodyOptions =
  | { body: Record<string, any>; method: "POST" | "PUT" | "PATCH" }
  | { body?: never; method?: "GET" | "DELETE" | "POST" };

export type FetchOptions = BodyOptions & {
  params?: Record<string, string>;
};

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
): Promise<RequestInit> {
  const [useAuth, authOptions] = args;
  const requestInit: RequestInit = {
    method: fetchOptions.method,
    credentials: requestNeedsCredentials(path, fetchOptions.method)
      ? "include"
      : "omit",
  };
  const headers: HeadersInit = {
    Accept: "*",
  };
  if (useAuth) {
    const { getAccessToken, accessToken } = authOptions;
    const token = accessToken ?? (await getAccessToken());
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  if (fetchOptions.body) {
    if (!fetchOptions.method)
      throw new Error("Method must be set when providing a body.");
    requestInit.body = JSON.stringify(fetchOptions.body);
    headers["Content-Type"] = "application/json";
  } else if (fetchOptions.method === "POST") {
    // Apparently POST requests with no body should specify Content-Length: 0, to prevent problems when using proxies.
    // https://stackoverflow.com/a/4198969
    headers["Content-Length"] = "0";
  }
  requestInit.headers = headers;
  return requestInit;
}

export async function fetchFromApi<T>(url: string, options: RequestInit) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (error) {
    console.error("Request to", url, "failed:", error);
    return {
      failed: true,
      res: null,
      hasBody: false,
      ok: false,
      data: null,
      error: null,
    } as const;
  }
  let data: T;
  try {
    data = await res.json();
  } catch (error) {
    console.error("Parsing JSON from", url, "failed:", error);
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

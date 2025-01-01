import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { getSearchParams } from "./backend";
import { User } from "./types";

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

const EPISODATE_URL = "https://www.episodate.com/api/";

const DECENTRALISED_ROUTES = [
  "liveseries/downloaded-episodes",
  "liveseries/subtitles",
  "liveseries/video",
  "torrents",
];

let refreshPromise: ReturnType<typeof refreshToken> | undefined = undefined;

// type ServerToApiResult<T> = Promise<
//   | { failed: true; res: null; data: null; hasBody: false }
//   | { failed: false; res: Response; data: null; hasBody: false }
//   | { failed: false; res: Response; data: T; hasBody: true }
// >;

export type ErrorResponseBody = { [code: string]: string };

function getUrlBase(path: string) {
  if (DECENTRALISED_ROUTES.some((route) => path.startsWith(route))) {
    return API_BASE_LIVESERIES_LOCAL;
  }
  if (path.startsWith("auth/")) {
    return API_BASE_AUTH;
  }
  return API_BASE;
}

/** Makes a server-to-server API call using cookie-based authentication.
 *
 * @returns A promise that resolves to an object of the following format:
 * {
 *   `failed`: true if the request didn't go through (network error, etc.);
 *   `hasBody`: true if the response has a JSON body (even if it's an error) -- available as `data`;
 *   `ok`: true if the response status is 2xx else `false`;
 *   `data`: the JSON body of the response typed as `T` if `ok` is `true`, otherwise `null`;
 *   `error`: `null` if `ok` is `true`, otherwise the JSON body of the response typed as `ErrorResponseBody`.
 * }
 */
export async function serverToApi<T>(
  path: string,
  {
    useAuth = true,
    params,
    body,
    method,
    api,
  }: {
    useAuth?: boolean;
    params?: Record<string, string>;
    api?: "episodate";
  } & (
    | { body: Record<string, any>; method: "POST" | "PUT" | "PATCH" }
    | { body?: never; method?: "GET" | "DELETE" }
  ) = {},
) {
  const cookieStore = await cookies();
  let res;
  const options: RequestInit = {
    method,
    next: {
      revalidate:
        api === "episodate"
          ? 3600
          : !method || method === "GET"
            ? 300
            : useAuth
              ? 0
              : 5,
    },
  };
  const headers: HeadersInit = {
    Accept: "*",
  };
  if (useAuth && !api) {
    const token = await getAccessToken(cookieStore);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  if (body) {
    if (!method) throw new Error("Method must be set when providing a body.");
    options.body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }
  options.headers = headers;
  if (!params?.lang) {
    const lang = cookieStore.get("lang")?.value || "EN";
    params = { ...params, lang };
  }
  const url = `${api === "episodate" ? EPISODATE_URL : getUrlBase(path)}${path}${getSearchParams(params)}`;
  console.debug("", options.method ?? "GET", url);
  try {
    res = await fetch(url, options);
  } catch (error) {
    console.error(error);
    return {
      failed: true,
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
    console.error(error);
    return {
      failed: false,
      hasBody: false,
      ok: false,
      data: null,
      error: null,
    } as const;
  }
  console.debug("...", res.status, res.statusText);
  if (res.ok) {
    return {
      failed: false,
      hasBody: true,
      ok: true,
      data,
      error: null,
    } as const;
  }
  return {
    failed: false,
    hasBody: true,
    ok: false,
    data: null,
    error: data as ErrorResponseBody,
  } as const;
}

/** Gets the access token from cookies, refreshing it if needed. */
export async function getAccessToken(
  cookieStore: ReadonlyRequestCookies,
): Promise<string | null> {
  const token = cookieStore.get("access_token")?.value;
  if (token) return token;
  return (await refreshAccessToken()).token;
}

/** Refreshes the access token using the refresh token.
 *
 * @returns an object containing the user & access token if refresh was successful, otherwise the fields are `null`.
 */
export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshToken();
  return refreshPromise;
}

async function refreshToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return { token: null, user: null };
  if (cookieStore.get("access_token")?.value) {
    throw new Error(
      "Refusing to refresh access token since it is still valid.",
    );
  }
  console.info("Refreshing access token...");
  const result = await serverToApi<{
    accessToken: string;
    expiresAt: number;
    user: User;
  }>("auth/refresh", {
    useAuth: false,
    body: { token: refreshToken },
    method: "POST",
  });
  return result.ok &&
    result.hasBody &&
    typeof result.data.accessToken === "string" &&
    result.data.accessToken.length > 0
    ? { token: result.data.accessToken, user: result.data.user }
    : { token: null, user: null };
}

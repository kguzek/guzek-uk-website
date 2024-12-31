import { cookies } from "next/headers";

const USE_LOCAL_API_URL = false;
// const USE_LOCAL_API_URL = true;

const useLocalUrl = process.env.NODE_ENV === "development" && USE_LOCAL_API_URL;

export const API_BASE =
  useLocalUrl && false ? "http://localhost:5017/" : "https://api.guzek.uk/";

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
 *   `data`: `null` if `hasBody` is false, otherwise the JSON body of the response typed as `T` or `ErrorResponseBody`, depending on `ok`.
 * }
 */
export async function serverToApi<T>(
  path: string,
  {
    useAuth = true,
    body,
    method,
  }: {
    useAuth?: boolean;
  } & (
    | { body: Record<string, any>; method: "POST" | "PUT" | "PATCH" }
    | { body?: never; method?: "GET" | "DELETE" }
  ) = {}
) {
  let res;
  const options: RequestInit = { method };
  const headers: HeadersInit = {
    Accept: "*",
  };
  if (useAuth) {
    const token = await getAccessToken();
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
  try {
    res = await fetch(`${getUrlBase(path)}${path}`, options);
  } catch (error) {
    console.error(error);
    return { failed: true, hasBody: false, ok: false, data: null } as const;
  }
  let data: T;
  try {
    data = await res.json();
  } catch (error) {
    console.error(error);
    return { failed: false, hasBody: false, ok: false, data: null } as const;
  }
  if (res.ok) {
    return { failed: false, hasBody: true, ok: true, data } as const;
  }
  return {
    failed: false,
    hasBody: true,
    ok: false,
    data: data as ErrorResponseBody,
  } as const;
}

/** Gets the access token from cookies, refreshing it if needed. */
export async function getAccessToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (token) return token;
  const refreshedSuccessfully = await refreshAccessToken();
  if (!refreshedSuccessfully) return null;
  return getAccessToken();
}

/** Refreshes the access token using the refresh token.
 *
 * @returns `true` if the access token was successfully refreshed, `false` otherwise.
 */
export async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return false;
  console.info("Refreshing access token...");
  const result = await serverToApi<{ accessToken: string; expiresAt: number }>(
    "auth/refresh",
    { useAuth: false, body: { token: refreshToken }, method: "POST" }
  );
  console.log("result:", result);
  return (
    result.ok &&
    result.hasBody &&
    typeof result.data.accessToken === "string" &&
    result.data.accessToken.length > 0
  );
}

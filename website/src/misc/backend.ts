import { StateSetter, User } from "./models";

const USE_LOCAL_API_URL = false;
const LOG_ACCESS_TOKEN = false;
const CACHE_NAME = "guzek-uk-cache";

interface RequestOptions {
  method: string;
  headers: { Authorization?: string; "Content-Type"?: string };
  body?: string;
}

export const API_BASE =
  process.env.NODE_ENV === "development" && USE_LOCAL_API_URL
    ? "http://localhost:5017/"
    : "https://api.guzek.uk/";

/** Gets the application's root cache storage. If the operation fails, returns `null`. */
export async function getCache() {
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

export function clearStoredLoginInfo() {
  localStorage.removeItem("user");
  localStorage.removeItem("accessTokenInfo");
  localStorage.removeItem("refreshToken");
}

export function getSearchParams(
  params: Record<string, string> | URLSearchParams = {}
) {
  const searchParams =
    params instanceof URLSearchParams ? params : new URLSearchParams(params);
  if ([...searchParams.keys()].length === 0) return "";
  return `?${searchParams}`;
}

/** Determines the API access token and generates a new one if it is out of date. */
async function getAccessToken(logout: () => void) {
  const accessTokenInfo = localStorage.getItem("accessTokenInfo");
  if (!accessTokenInfo) {
    return null;
  }
  const tokenInfo = JSON.parse(accessTokenInfo);
  // Check if it's expired
  const tokenNotExpired = new Date(tokenInfo.expiresAt) > new Date();
  if (tokenNotExpired && tokenInfo.accessToken) {
    return tokenInfo.accessToken as string;
  }
  // Generate a new access token
  const token = localStorage.getItem("refreshToken") ?? "";
  const req = await createRequest(
    "auth/token",
    "POST",
    { body: { token } },
    logout,
    false
  );
  console.info("Refreshing expired access token...");
  const res = await fetch(req);
  if (!res.ok) {
    console.error("Failed to refresh the access token. Logging out.");
    clearStoredLoginInfo();
    logout();
    return null;
  }
  const body = await res.json();
  updateAccessToken(body.accessToken);
  return body.accessToken as string;
}

/** Instantiates a `Request` object with the attributes provided.
 *  Automatically applies the user access token to the `Authorization` header
 *  as well as determining the `Content-Type` and URL search query parameters.
 */
async function createRequest(
  path: string,
  method: string,
  {
    params,
    body,
  }: {
    params?: Record<string, string> | URLSearchParams;
    body?: Record<string, any>;
  },
  logout: () => void,
  useAccessToken: boolean = true
) {
  const url = API_BASE + path + getSearchParams(params);
  const options: RequestOptions = {
    method,
    headers: {},
  };
  // Set the request payload (if present)
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  // Set the authorisation headers
  if (useAccessToken) {
    const accessToken = await getAccessToken(logout);
    if (accessToken) {
      LOG_ACCESS_TOKEN && console.info(accessToken);
      options.headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }
  return new Request(url, options);
}

/** Performs an HTTPS request to the API using the provided values and the stored access token. */
export async function fetchFromAPI(
  path: string,
  {
    method = "GET",
    params,
    body,
  }: {
    method?: string;
    params?: Record<string, string> | URLSearchParams;
    body?: Record<string, any>;
  },
  logout: () => void,
  useCache: boolean = false
) {
  const request = await createRequest(path, method, { params, body }, logout);
  const func = useCache ? fetchWithCache : fetch;
  return await func(request);
}

/** Searches for the corresponding cache for the given request. If found, returns
 *  the cached response. Otherwise, performs the fetch request and adds the response
 *  to cache. Returns the HTTP response.
 */
export async function fetchWithCache(request: Request) {
  const cache = await getCache();
  if (!cache) {
    return await fetch(request);
  }

  // Check if response is already cached
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.debug("Using cached response for", request.url);
    return cachedResponse.clone();
  }

  // Fetch new response
  console.debug("Fetching", request.url, "...");
  const response = await fetch(request);

  // Cache the new response
  if (
    response.ok /*&& response.clone().headers.get("Cache-Control") !== "no-store"*/
  ) {
    await cache.put(request, response.clone());
    console.debug("Cached response as", response.url);
  }
  return response.clone();
}

/** Sets the access token metadata (value and expiration date) in the local storage. */
export function updateAccessToken(accessToken: string) {
  // Set the expiry date to 30 minutes from now
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);
  const accessTokenInfo = { accessToken, expiresAt };
  localStorage.setItem("accessTokenInfo", JSON.stringify(accessTokenInfo));
}

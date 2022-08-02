const USE_EMULATOR_URL = 1;
const LOG_ACCESS_TOKEN = false;
const CACHE_NAME = "guzek-uk-cache";

interface RequestOptions {
  method: string;
  headers: { Authorization?: string; "Content-Type"?: string };
  body?: string;
}

export const API_BASE =
  process.env.NODE_ENV === "development" && USE_EMULATOR_URL
    ? "http://localhost:5017/"
    : "https://api.guzek.uk/";

/** Gets the application's root cache storage. */
export const getCache = () => caches.open(CACHE_NAME);

export function getRequest(
  path: string,
  method: string,
  {
    params = {},
    body = {},
  }: {
    params?: Record<string, string> | URLSearchParams;
    body?: Record<string, any>;
  }
) {
  function getSearchParams() {
    if (Object.keys(params).length === 0) return "";
    const searchParams =
      params instanceof URLSearchParams ? params : new URLSearchParams(params);
    return `?${searchParams}`;
  }

  const url = API_BASE + path + getSearchParams();
  const options: RequestOptions = {
    method,
    headers: {},
  };
  if (Object.keys(body).length > 0) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  return new Request(url, options);
}

/** Searches for the corresponding cache for the given request. If found, returns
 *  the cached response. Otherwise, performs the fetch request and adds the response
 *  to cache. Returns the HTTP response.
 */
export async function fetchCachedData(request: Request) {
  const cache = await getCache();

  // Check if response is already cached
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.debug("Using cached response for", request.url);
    return cachedResponse.clone();
  }

  // Fetch new response
  console.debug("Fetching", request.url, "...");
  const response = await fetchFromAPI(request);
  const responseDate = new Date().getTime().toString();
  response.headers.set("Date", responseDate);

  // Cache the new response
  if (
    response.ok /*&& response.clone().headers.get("Cache-Control") !== "no-store"*/
  ) {
    await cache.put(request, response.clone());
    console.info("Cached response as", response.url);
  }
  return response.clone();
}

/** Performs a fetch from the API using the given values. */
function fetchWithToken(request: Request, accessToken?: string) {
  if (accessToken) {
    LOG_ACCESS_TOKEN && console.info(accessToken);
    request.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return fetch(request);
}

/** Sets the access token metadata (value and expiration date) in the local storage. */
export function updateAccessToken(accessToken: string) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);
  const accessTokenInfo = { accessToken, expiresAt };
  localStorage.setItem("accessTokenInfo", JSON.stringify(accessTokenInfo));
}

/** Determines the API access token and generates a new one if it is out of date. Fetches from the API
 *  by substituting in the absolute URL and authorisation headers, as well as serialises the JSON payload.
 */
export async function fetchFromAPI(request: Request) {
  // Get the locally saved access token
  let accessToken;
  const accessTokenInfo = localStorage.getItem("accessTokenInfo");
  if (accessTokenInfo) {
    const tokenInfo = JSON.parse(accessTokenInfo);
    // Check if it's expired
    if (new Date(tokenInfo.expiresAt) < new Date()) {
      // Generate a new access token
      const token = localStorage.getItem("refreshToken") ?? "";
      const req = getRequest("auth/token", "POST", { body: { token } });
      const res = await fetchWithToken(req);
      if (res.ok) {
        ({ token: accessToken } = await res.json());
        updateAccessToken(accessToken);
      }
    } else {
      accessToken = tokenInfo.accessToken;
    }
  }
  return await fetchWithToken(request, accessToken);
}

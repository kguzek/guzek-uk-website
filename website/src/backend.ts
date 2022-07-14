const USE_EMULATOR_URL = false;
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

/** Searches for the corresponding cache for the given request. If found, returns
 *  the cached response. Otherwise, performs the fetch request and adds the response
 *  to cache. Returns the HTTP response.
 */
export async function fetchCachedData(
  path: string,
  method: string = "GET",
  params?: Record<string, string>,
  body?: BodyInit
) {
  // Add search parameters to URL
  const search = params ? `?${new URLSearchParams(params)}` : "";
  const relativeURL = path + search;
  const fetchOptions = { method, body };

  const request = new Request(relativeURL, fetchOptions);
  const cachedResponse = await caches.match(request);
  const absoluteURL = API_BASE + relativeURL;
  if (cachedResponse) {
    console.debug("Using cached response for", absoluteURL);
    return cachedResponse.clone();
  }

  console.debug("Fetching", absoluteURL, "...");
  const response = await fetchFromAPI(relativeURL, "GET");
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

/** Performs a fetch from the API using the given values. */
function fetchWithBody(
  path: string,
  method: string = "GET",
  body?: object,
  accessToken?: string
) {
  const options: RequestOptions = {
    method,
    headers: {},
  };
  if (accessToken) {
    LOG_ACCESS_TOKEN && console.info(accessToken);
    options.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  return fetch(API_BASE + path, options);
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
export async function fetchFromAPI(
  path: string,
  method: string = "GET",
  body?: object
) {
  // Get the locally saved access token
  let accessToken;
  const accessTokenInfo = localStorage.getItem("accessTokenInfo");
  if (accessTokenInfo) {
    const tokenInfo = JSON.parse(accessTokenInfo);
    // Check if it's expired
    if (new Date(tokenInfo.expiresAt) < new Date()) {
      // Generate a new access token
      const token = localStorage.getItem("refreshToken");
      const res = await fetchWithBody("auth/token", "POST", { token });
      if (res.ok) {
        ({ token: accessToken } = await res.json());
        updateAccessToken(accessToken);
      }
    } else {
      accessToken = tokenInfo.accessToken;
    }
  }
  return await fetchWithBody(path, method, body, accessToken);
}

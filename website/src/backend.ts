const USE_EMULATOR_URL = false;
const CACHE_NAME = "guzek-uk-cache";

const API_URL =
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
  params?: string,
  body?: BodyInit
) {
  // Add search parameters to URL
  const search = params ? `?${new URLSearchParams(params)}` : "";
  const url = API_URL + path + search;
  const fetchOptions = { method, body };

  const request = new Request(url, fetchOptions);
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.debug("Using cached response for", url);
    return cachedResponse.clone();
  }

  console.debug("Fetching", url, "...");
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
  }
  return response.clone();
}

const USE_EMULATOR_URL = false;

const API_URL =
  process.env.NODE_ENV === "development" && USE_EMULATOR_URL
    ? "http://localhost:5017/"
    : "https://api.guzek.uk/";

/** Searches for the corresponding cache for the given request. If found, returns
 *  the cached response. Otherwise, performs the fetch request and adds the response
 *  to cache. Returns the HTTP response.
 */
export async function fetchCachedData(path, method = "GET", params, body) {
  // Add search parameters to URL
  const search = params ? `?${new URLSearchParams(params)}` : "";
  const url = API_URL + path + search;
  const fetchOptions = { method };
  body && (fetchOptions.body = body);
  const request = new Request(url, fetchOptions);
  const _cache = await caches.open("cache");
  const cache = await _cache.match(request);
  if (cache) {
    console.debug("Using cached response for", url);
    return cache;
  }

  console.debug("Fetching", url, "...");
  const response = await fetch(request);
  await _cache.put(request, response);
  return response;
}

/** Consumes the body of a cloned response object. If the status is non-200 and
 *  `onError` is provided, returns `onError`. Otherwise returns the consumed body.
 */
export async function readResponseBody(res, onError) {
  if (!res.ok) {
    console.log("The API returned a non-200 response:", res);
    if (onError) return onError;
  }
  const data = await res.clone().json();
  return data;
}

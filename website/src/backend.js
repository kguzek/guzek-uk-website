const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:5017/" : "https://api.guzek.uk/";

/** Performs a HTTP request to the API using the specified relative URL and HTTP method. */
export function fetchFromAPI(url, method = "get") {
  console.log(`Fetching '/api/${url}'...`);
  return fetch(API_URL + url, { headers: { method } });
}

const API_URL = "https://api.guzek.uk/"; // "https://europe-west1-guzek-uk.cloudfunctions.net/api/";

/** Performs a HTTP request to the API using the specified relative URL and HTTP method. */
export function fetchFromAPI(url, method = "get") {
  console.log(`Fetching '/api/${url}'...`);
  return fetch(API_URL + url, { headers: { method } });
}

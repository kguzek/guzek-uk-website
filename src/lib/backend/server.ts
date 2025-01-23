import { cookies } from "next/headers";
import { getSearchParams } from "../backend";
import { fetchFromApi, getUrlBase, prepareRequest } from ".";
import type { ServerFetchOptions } from ".";
import { useAuth } from "@/lib/backend/user";

const EPISODATE_URL = "https://www.episodate.com/api/";

/** Makes a server-to-server API call using cookie-based authentication.
 *
 * @param path The relative path to the API endpoint, where the base is inferred from the path or the `fetchOptions.api` parameter.
 * @param fetchOptions The options to pass to the fetch function, with an optional additional `api` string property to specify the API to use. Accepted values for `fetchOptions.api` are `"episodate"`.
 * @returns A promise that resolves to an object of the following format:
 * ```ts
 * {
 *   failed: boolean; // `true` if the request didn't go through (network error, etc.), else `false
 *   res: Response | null; // the response object if `failed is `false`, else `null`
 *   hasBody: boolean; // true if the response has a JSON body available as `data` or `error`
 *   ok: boolean; // equivalent to `res.ok && hasBody`, for convenience
 *   data: T | null; // the JSON body of the response if `ok` is `true`, otherwise `null`
 *   error: ErrorResponseBody | null; // `null` if `ok` is `true`, otherwise the JSON body of the response
 * }```
 */
export async function serverToApi<T>(
  path: string,
  fetchOptions: ServerFetchOptions = {},
  useCredentials: boolean = true,
) {
  const cookieStore = await cookies();
  if (!fetchOptions.params?.lang) {
    const lang = cookieStore.get("lang")?.value || "EN";
    fetchOptions.params = { ...fetchOptions.params, lang };
  }
  const { accessToken, user } = await useAuth();

  const options = await prepareRequest(
    path,
    fetchOptions,
    accessToken,
    useCredentials,
  );
  options.next.revalidate =
    fetchOptions.api === "episodate"
      ? 3600
      : !fetchOptions.method || fetchOptions.method === "GET"
        ? 300
        : useCredentials
          ? 0
          : 5;
  const url = `${fetchOptions.api === "episodate" ? EPISODATE_URL : getUrlBase(path, user)}${path}${getSearchParams(fetchOptions.params)}`;
  // console.debug("", options.method ?? "GET", url);
  return await fetchFromApi<T>(url, options);
}

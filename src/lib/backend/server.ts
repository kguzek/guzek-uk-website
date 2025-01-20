import { cookies } from "next/headers";
import { getSearchParams } from "../backend";
import { fetchFromApi, getUrlBase, prepareRequest } from ".";
import type { ServerFetchOptions } from ".";
import { parseUser } from "@/lib/backend/user";

const EPISODATE_URL = "https://www.episodate.com/api/";

let refreshPromise: ReturnType<typeof _refreshAccessToken> | undefined =
  undefined;

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
  useAuth: boolean = true,
) {
  const cookieStore = await cookies();
  if (!fetchOptions.params?.lang) {
    const lang = cookieStore.get("lang")?.value || "EN";
    fetchOptions.params = { ...fetchOptions.params, lang };
  }
  const options = await prepareRequest(path, fetchOptions, useAuth, {
    getAccessToken,
  });
  options.next.revalidate =
    fetchOptions.api === "episodate"
      ? 3600
      : !fetchOptions.method || fetchOptions.method === "GET"
        ? 300
        : useAuth
          ? 0
          : 5;
  const user = useAuth ? parseUser(await getAccessToken()) : null;
  const url = `${fetchOptions.api === "episodate" ? EPISODATE_URL : getUrlBase(path, user)}${path}${getSearchParams(fetchOptions.params)}`;
  // console.debug("", options.method ?? "GET", url);
  return await fetchFromApi<T>(url, options);
}

/** Gets the access token from cookies, refreshing it if needed. */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (token) return token;
  return refreshAccessToken();
}

/** Refreshes the access token using the refresh token.
 *
 * @returns the access token if refresh was successful, otherwise `null`.
 */
const refreshAccessToken = () => (refreshPromise ??= _refreshAccessToken());

async function _refreshAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return null;
  if (cookieStore.get("access_token")?.value) {
    throw new Error(
      "Refusing to refresh access token since it is still valid.",
    );
  }
  console.info("Refreshing access token...");
  const result = await serverToApi<{
    accessToken: string;
    // expiresAt: number;
    // user: User;
  }>(
    "auth/refresh",
    {
      body: { token: refreshToken },
      method: "POST",
    },
    false,
  );
  return result.ok &&
    typeof result.data.accessToken === "string" &&
    result.data.accessToken.length > 0
    ? result.data.accessToken
    : null;
}

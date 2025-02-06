import {
  ClientFetchOptions,
  commonTriggerRevalidation,
  fetchFromApi,
  getUrlBase,
  prepareRequest,
} from ".";
import { getSearchParams } from "../backend";
import type { Language } from "../enums";
import { TRANSLATIONS } from "../translations";
import type { User } from "../types";
import { getErrorMessage } from "../util";

type FetchOptionsExtension = { user?: User | null } & (
  | {
      userLanguage: Language;
      setModalError: (error: string) => void;
    }
  | { userLanguage?: never; setModalError?: never }
);

const requestNeedsCredentials = (
  path: string,
  method: ClientFetchOptions["method"],
) =>
  (method === "POST" || method === "DELETE") &&
  ["auth/tokens", "auth/refresh", "auth/users"].includes(path);

/** Makes a client-to-server API call using the provided access token.
 *
 * @param path The relative path to the API endpoint, where the base is inferred from the path.
 * @param fetchOptions The options to pass to the fetch function, which are of type `FetchOptions`.
 * @param accessToken The access token to use for authentication. Non-authenticated requests are preferred be made on the server using `serverToApi`. If they are to be made on the client, set this to an empty string.
 * @param userLanguage The language to use for the error modal that will be shown on a non-ok response. If not provided, no modal will not be shown.
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
export async function clientToApi<T>(
  path: string,
  accessToken: string = "",
  {
    user = null,
    userLanguage,
    setModalError,
    ...fetchOptions
  }: ClientFetchOptions & FetchOptionsExtension = {},
) {
  const options = await prepareRequest(path, fetchOptions, accessToken);

  options.credentials = requestNeedsCredentials(path, fetchOptions.method)
    ? "include"
    : "omit";

  const url = `${getUrlBase(path, user)}${path}${getSearchParams(fetchOptions.params)}`;
  const result = await fetchFromApi<T>(url, options);
  if (result.ok) {
    await triggerRevalidation(path);
  } else if (userLanguage) {
    const data = TRANSLATIONS[userLanguage];
    setModalError(
      result.hasBody
        ? getErrorMessage(result.res, result.error, data)
        : data.networkError,
    );
  }

  return result;
}

/** Makes a request to the Next server to revalidate the tag corresponding to the path, and logs a message on failure. */
export const triggerRevalidation = (path: string) =>
  commonTriggerRevalidation(path, (path, fetchOptions) =>
    clientToApi(path, "", fetchOptions),
  );

/** Performs a fetch to forcefully refresh the access token. Can be used to update the user information stored in the token. */
export async function triggerTokenRefresh() {
  const result = await clientToApi("auth/refresh", "", { method: "POST" });
  if (result.ok) return;
  console.error("Failed to refresh access token on client side:", result);
}

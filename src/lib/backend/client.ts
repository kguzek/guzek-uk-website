import {
  ClientFetchOptions,
  fetchFromApi,
  getUrlBase,
  prepareRequest,
  triggerRevalidation,
} from ".";
import { getSearchParams } from "../backend";
import { getErrorMessage } from "../util";
import type { Language } from "../enums";
import type { User } from "../types";
import { TRANSLATIONS } from "../translations";

type FetchOptionsExtension = { user?: User | null } & (
  | {
      userLanguage: Language;
      setModalError: (error: string) => void;
    }
  | { userLanguage?: never; setModalError?: never }
);

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
  accessToken: string,
  {
    user = null,
    userLanguage,
    setModalError,
    ...fetchOptions
  }: ClientFetchOptions & FetchOptionsExtension,
) {
  const options = await prepareRequest(
    path,
    fetchOptions,
    ...(accessToken ? [true, { accessToken }] : [false, null]),
  );
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

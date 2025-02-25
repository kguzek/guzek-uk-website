import type { BaseFetchOptions } from ".";
import type { ApiMessage, ErrorResponseBodyPayloadCms, User } from "../types";
import { getSearchParams, parseResponseBody } from ".";
import { TRANSLATIONS } from "../translations";
import { getErrorMessage } from "../util";

type ErrorType = "network" | "http" | "body" | "json";

export type FetchOptionsV2 = BaseFetchOptions & {
  accessToken?: string | null;
  urlBase?: string;
};

class RequestError extends Error {
  type: ErrorType;

  constructor(message: string, type: ErrorType) {
    super(message);
    this.type = type;
  }
}

export class NetworkError extends RequestError {
  constructor() {
    super("Network error", "network");
  }
}

export class HttpError extends RequestError {
  response: Response;
  error: ErrorResponseBodyPayloadCms;

  constructor(response: Response, error: ErrorResponseBodyPayloadCms) {
    // TODO: PL translation support
    super(getErrorMessage(response, error, TRANSLATIONS.EN), "http");
    this.error = error;
    this.response = response;
  }
}

export class BodyConsumptionError extends RequestError {
  response: Response;

  constructor(response: Response) {
    super("Body consumption error", "body");
    this.response = response;
  }
}

export class JsonParsingError extends RequestError {
  response: Response;
  data: string;

  constructor(response: Response, data: string) {
    super("Body parsing error", "json");
    this.response = response;
    this.data = data;
  }
}

export type FetchError =
  | NetworkError
  | HttpError
  | BodyConsumptionError
  | JsonParsingError;

async function getResponse<T>(url: string, options: RequestInit) {
  const method = options.method ?? "GET";
  let res;
  try {
    res = await fetch(url, options);
  } catch (error) {
    console.error(method, url, "FAILED:", error);
    throw new NetworkError();
  }
  let body: string;
  try {
    body = await res.text();
  } catch {
    throw new BodyConsumptionError(res);
  }
  let data: T;
  if (res.headers.get("Content-Type")?.includes("application/json")) {
    const trimmed = body.trim();
    try {
      // Use this method because sometimes res.json() fails with weird errors
      data = parseResponseBody(trimmed);
    } catch (error) {
      console.error(
        "FAILED to parse JSON from",
        method,
        url,
        "with status:",
        res.status,
        res.statusText,
        error,
        "and response body:",
        body,
      );
      throw new JsonParsingError(res, trimmed);
    }
  } else {
    console.warn("Non-JSON response received, proceeding");
    data = body as T;
  }

  // console.debug("...", res.status, res.statusText);
  if (!res.ok) {
    throw new HttpError(res, data as ErrorResponseBodyPayloadCms);
  }
  return { res, data };
}

export async function fetchFromApi<T>(
  path: string,
  { accessToken, ...fetchOptions }: FetchOptionsV2 = {},
) {
  const requestInit: RequestInit = {
    method: fetchOptions.method,
    credentials: "include",
  };
  const headers: HeadersInit = {
    Accept: "application/json",
    ...fetchOptions.headers,
  };
  if (accessToken != null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (fetchOptions.body) {
    requestInit.body = JSON.stringify(fetchOptions.body);
    headers["Content-Type"] = "application/json";
  } else if (fetchOptions.method === "POST") {
    // Apparently POST requests with no body should specify Content-Length: 0, to prevent problems when using proxies.
    // https://stackoverflow.com/a/4198969
    headers["Content-Length"] = "0";
  }
  requestInit.headers = headers;
  const prefix = fetchOptions.urlBase ?? `${process.env.WEBSITE_URL ?? ""}/api/`;
  const url = `${prefix}${path}${getSearchParams(fetchOptions.params)}`;
  return getResponse<T>(url, requestInit);
}

export async function refreshAccessToken() {
  const result = await fetchFromApi<
    ApiMessage & { refreshedToken: string; exp: number; user: User }
  >("users/refresh-token", { method: "POST" });
  console.info("Access token refreshed", result.data.exp);
  return result;
}

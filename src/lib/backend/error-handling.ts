import type { ErrorResponseBodyPayloadCms } from "../types";
import { parseResponseBody } from ".";
import { TRANSLATIONS } from "../translations";
import { getErrorMessage } from "../util";

type ErrorType = "network" | "http" | "body" | "json";

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

export async function getResponse<T>(url: string, options: RequestInit) {
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

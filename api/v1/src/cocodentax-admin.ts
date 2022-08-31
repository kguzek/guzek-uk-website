import { Response } from "express";
import request from "request";

type AuthCredentials = { user: string | undefined; pass: string | undefined };

function getDefaultCallback(res: Response) {
  const callback: request.RequestCallback = (err, response, body) => {
    if (err) {
      console.error("Request failed:", err);
      res.status(500).json(err);
    }
    const json = JSON.parse(body);
    console.info("Received", response.statusCode, "response from external API");
    res.status(response.statusCode).json(json);
  };
  return callback;
}

export function fetchWithAuth(
  url: string,
  res: Response | request.RequestCallback,
  credentials?: AuthCredentials | string,
  method = "GET",
  body?: object
) {
  const requestFunc = method === "POST" ? request.post : request.get;

  const requestOptions: {
    headers: request.Headers;
    auth?: request.AuthOptions;
    body?: string;
  } = {
    headers: { Accept: "application/vnd.allegro.public.v1+json" },
  };
  if (credentials) {
    if (typeof credentials === "string") {
      // `credentials` is the bearer token
      requestOptions.headers.Authorization = credentials;
    } else {
      // `credentials` is an object containing username and password for Base64 encoding
      requestOptions.auth = credentials;
    }
  }
  if (body) {
    requestOptions.body = JSON.stringify(body);
    requestOptions.headers["Content-Type"] = "application/json;";
  }
  const callback = (res as Response).status
    ? getDefaultCallback(res as Response)
    : (res as request.RequestCallback);

  requestFunc(url, requestOptions, callback);
}

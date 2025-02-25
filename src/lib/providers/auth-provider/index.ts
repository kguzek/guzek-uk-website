import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import type { User } from "@/lib/types";

import { refreshAccessToken as performTokenRefresh } from "../../backend/v2";

const USER_REQUIRED_PROPERTIES = ["id", "username", "email", "role", "serverUrl"];
let refreshPromise: ReturnType<typeof _refreshAccessToken> | null = null;

type AccessTokenPayload = User & { iat: number; exp: number };

function parseJwt(token: string): string {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid JWT token ${token}`);
  }
  const payload = parts[1];
  return Buffer.from(payload, "base64").toString();
}

function validateUser(parsedUser: { [key: string]: unknown }) {
  for (const property of USER_REQUIRED_PROPERTIES) {
    if (parsedUser[property] !== undefined) continue;
    console.warn("User", parsedUser, "is missing required property", property);
    return null;
  }
  // for (const dateString of [parsedUser.created_at, parsedUser.modified_at]) {
  //   if (typeof dateString !== "string" || isInvalidDate(new Date(dateString))) {
  //     console.warn("User", parsedUser, "has invalid date string", dateString);
  //     return null;
  //   }
  // }
  return parsedUser as unknown as AccessTokenPayload;
}

/** Extracts and parses the user object from the JWT access token. */
function decodeAccessToken(accessToken: string | null) {
  if (!accessToken) return null;
  let rawUser;
  try {
    rawUser = parseJwt(accessToken);
  } catch (error) {
    console.error("Error parsing JWT body", error);
    return null;
  }
  let parsedUser;
  try {
    parsedUser = JSON.parse(rawUser);
  } catch (error) {
    console.error("Error parsing user payload", error);
    return null;
  }
  if (!parsedUser) return null;
  const payload = validateUser(parsedUser);
  if (!payload) return null;
  const { iat, exp, ...user } = payload;
  return { iat, exp, user };
}

/** Gets the access token from cookies. */
async function getAccessToken(
  cookieStore: RequestCookies | ReadonlyRequestCookies,
): Promise<string | null> {
  const token = cookieStore.get("payload-token")?.value;
  if (!token) return null;
  return token;
}

/** Refreshes the access token using the refresh token.
 *
 * @returns the access token if refresh was successful, otherwise `null`.
 */
async function refreshAccessToken(reason: string) {
  // if (request == null || response == null) {
  //   return null;
  // }
  if (refreshPromise) return refreshPromise;
  // const refreshToken = request.cookies.get("refresh_token")?.value;
  // if (!refreshToken) return null;
  console.info(`Refreshing access token (${reason})...`);
  refreshPromise = _refreshAccessToken();
  return refreshPromise;
}

async function _refreshAccessToken() {
  const result = await performTokenRefresh();
  refreshPromise = null;
  return result.data;
}

/** Checks if the access token will expire within the threshold.
 *
 * @param exp The expiration time of the token, in seconds.
 * @param thresholdMinutes The number of minutes before expiration to consider the token as expiring soon. Default is 5 minutes.
 */
function expiresSoon(exp: number, thresholdMinutes = 5) {
  const now = Date.now();
  const diff = exp * 1000 - now;
  // console.debug("Token will expire in", diff, "ms");
  return diff < thresholdMinutes * 60 * 1000;
}

/** Retrieves the access token from cookies and decodes the payload into a user object. */
export async function getAuthBase(cookieStore: RequestCookies | ReadonlyRequestCookies) {
  let accessToken = await getAccessToken(cookieStore);
  if (accessToken == null || accessToken === "") return { user: null, accessToken: null };
  let jwtPayload = decodeAccessToken(accessToken);
  if (jwtPayload == null) {
    console.warn("No user found in access token", jwtPayload);
    return { user: null, accessToken: null };
  }
  if (expiresSoon(jwtPayload.exp)) {
    try {
      const refreshResult = await refreshAccessToken("soon to expire");
      accessToken = refreshResult.refreshedToken;
      const newPayload = decodeAccessToken(accessToken);
      if (newPayload == null) {
        console.warn("Newly refreshed token cannot be decoded", refreshResult);
      } else if (expiresSoon(newPayload.exp)) {
        console.error("Refreshed token still expires soon", jwtPayload, "->", newPayload);
      } else {
        jwtPayload = newPayload;
      }
    } catch (error) {
      console.error("Failed to refresh token which will expire soon", error);
    }
  }
  return { user: jwtPayload.user, accessToken };
}

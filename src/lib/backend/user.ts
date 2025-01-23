import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { User } from "@/lib/types";
import { isInvalidDate } from "../util";
import { refreshAccessToken } from "./server";

const USER_REQUIRED_PROPERTIES = [
  "uuid",
  "username",
  "email",
  "admin",
  "serverUrl",
  "created_at",
  "modified_at",
];

type AccessTokenPayload = User & { iat: number; exp: number };

function parseJwt(token: string): string {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid JWT token ${token}`);
  }
  const payload = parts[1];
  return Buffer.from(payload, "base64").toString();
}

function validateUser(parsedUser: any) {
  for (const property of USER_REQUIRED_PROPERTIES) {
    if (parsedUser[property] !== undefined) continue;
    console.warn("User", parsedUser, "is missing required property", property);
    return null;
  }
  for (const dateString of [parsedUser.created_at, parsedUser.modified_at]) {
    if (isInvalidDate(new Date(dateString))) {
      console.warn("User", parsedUser, "has invalid date string", dateString);
      return null;
    }
  }
  return parsedUser as AccessTokenPayload;
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
async function getAccessToken(request?: NextRequest): Promise<string | null> {
  const cookieStore = request?.cookies ?? (await cookies());
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  return token;
}

async function refreshToken(reason: string, response?: NextResponse) {
  if (!response) {
    return { user: null, accessToken: null };
  }
  console.info(`Refreshing access token (${reason})...`);
  const accessToken = await refreshAccessToken();
  if (!accessToken) {
    return { user: null, accessToken: null } as const;
  }
  return { accessToken } as const;
}

/** Checks if the access token will expire within the threshold.
 *
 * @param exp The expiration time of the token.
 * @param thresholdMinutes The number of minutes before expiration to consider the token as expiring soon. Default is 5 minutes.
 */
function tokenWillExpireSoon(exp: number, thresholdMinutes = 5) {
  const now = Date.now();
  return exp - now < thresholdMinutes * 60 * 1000;
}

/** Retrieves the access token from cookies and decodes the payload into a user object.
 *
 * @param response If provided, the request object to use for automatically refreshing the access token and saving the new one to cookies.
 */
export async function useAuth(
  request?: NextRequest,
  response?: NextResponse,
): Promise<
  { user: User; accessToken: string } | { user: null; accessToken: null }
> {
  let accessToken = await getAccessToken(request);
  let refreshed = false;
  if (!accessToken) {
    const result = await refreshToken("cookie missing", response);
    if (result.accessToken == null) return result;
    refreshed = true;
    accessToken = result.accessToken;
  }
  let payload = decodeAccessToken(accessToken);
  if (!payload) return { user: null, accessToken: null };
  if (tokenWillExpireSoon(payload.exp)) {
    const result = await refreshToken("soon to expire", response);
    if (result.accessToken == null) {
      console.warn("Failed to refresh access token.");
    } else {
      refreshed = true;
      payload = decodeAccessToken(result.accessToken);
      if (!payload) throw new Error("Newly refreshed token cannot be decoded");
      if (tokenWillExpireSoon(payload.exp))
        throw new Error("Newly refreshed token still expires soon");
    }
  }
  if (refreshed) {
    response!.cookies.set("access_token", accessToken, {
      domain: ".guzek.uk",
      httpOnly: true,
      expires: payload.exp,
      secure: true,
    });
  }
  return { user: payload.user, accessToken };
}

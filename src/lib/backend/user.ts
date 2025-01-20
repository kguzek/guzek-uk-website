import { getAccessToken } from "@/lib/backend/server";
import type { User } from "@/lib/types";
import { isInvalidDate } from "../util";

const USER_REQUIRED_PROPERTIES = [
  "uuid",
  "username",
  "email",
  "admin",
  "serverUrl",
  "created_at",
  "modified_at",
];

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
  return parsedUser as User;
}

/** Extracts and parses the user object from the JWT access token. */
export function parseUser(accessToken: string | null): User | null {
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
  return validateUser(parsedUser);
}

/** Tries to retrieve and parse the user from cookies, querying the API if the cookie is not present. */
export async function getCurrentUser(): Promise<User | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  const user = parseUser(accessToken);
  // TODO: make this return an object with user and access token, to reduce boilerplate
  return user;
}
import { cookies } from "next/headers";
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

async function rejectSavedUser(user: any) {
  console.warn("Rejecting saved user:", user);
  const cookieStore = await cookies();
  cookieStore.set("user", "", { expires: new Date(0) });
}

function validateUser(parsedUser: any) {
  for (const property of USER_REQUIRED_PROPERTIES) {
    if (parsedUser[property] !== undefined) continue;
    rejectSavedUser(parsedUser);
    return null;
  }
  if (
    Object.keys(parsedUser).length !==
    Object.keys(USER_REQUIRED_PROPERTIES).length
  ) {
    rejectSavedUser(parsedUser);
    return null;
  }
  for (const dateString of [parsedUser.created_at, parsedUser.modified_at]) {
    if (isInvalidDate(new Date(dateString))) {
      rejectSavedUser(parsedUser);
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

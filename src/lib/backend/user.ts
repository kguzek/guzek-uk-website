import { cookies } from "next/headers";
import { refreshAccessToken } from "@/lib/backend/server";
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

/** Retrieves and parses the user from cookies but does not attempt to re-establish the identity if the cookie is not present. */
export async function getUserOnce(): Promise<User | null> {
  const cookieStore = await cookies();
  // console.log("Cookies:", cookieStore.getAll());
  const value = cookieStore.get("user")?.value;
  if (!value) return null;
  return parseUser(value);
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

function parseUser(value: string): User | null {
  let parsedUser;
  try {
    parsedUser = JSON.parse(value);
  } catch (error) {
    console.error("Error parsing user cookie", error);
    return null;
  }
  if (!parsedUser) return null;
  return validateUser(parsedUser);
}

// TODO: make this return an object with user and access token, to reduce boilerplate
/** Tries to retrieve and parse the user from cookies, querying the API if the cookie is not present. */
export async function getCurrentUser(): Promise<User | null> {
  const value = await getUserOnce();
  if (value) return value;
  const { user } = await refreshAccessToken();
  return user;
}

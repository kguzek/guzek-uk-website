import type { NextRequest, NextResponse } from "next/server";

import type { User } from "@/payload-types";
import { fetchFromApi } from "@/lib/backend";

import { getAuthFromCookies } from "./cookies";

export async function getUser(request: NextRequest, response: NextResponse) {
  const { user, accessToken } = await getAuthFromCookies(request.cookies);
  if (user == null) {
    response.cookies.delete("payload-token");
    return null;
  }
  let result;
  try {
    result = await fetchFromApi<{ user: User | null }>("users/me", { accessToken });
    // console.debug("Current username:", result.data.user?.username);
  } catch (error) {
    console.warn("Error fetching user at API level:", (error as Error).message);
    response.cookies.delete("payload-token");
    return null;
  }
  return result.data.user;
}

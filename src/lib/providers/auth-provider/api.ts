import type { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

import { getAuthFromCookies } from "./cookies";

export async function getUser(request: NextRequest, response: NextResponse) {
  const { user } = await getAuthFromCookies(request.cookies, response.cookies);
  if (user == null) {
    response.cookies.delete("payload-token");
    return null;
  }
  const payload = await getPayload({ config });
  let result: Awaited<ReturnType<typeof payload.auth>>;
  try {
    result = await payload.auth({ headers: request.headers });
  } catch (error) {
    console.warn("Error fetching user from payload", error);
    result = { user: null, permissions: {} };
  }
  if (result.user == null) {
    response.cookies.delete("payload-token");
    return null;
  }
  return result.user;
}

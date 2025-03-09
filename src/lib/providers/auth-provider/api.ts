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
  const result = await payload.auth({ headers: request.headers });
  if (result.user == null) {
    response.cookies.delete("payload-token");
    return null;
  }
  return result.user;
}

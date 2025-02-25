import type { NextRequest } from "next/server";

import { getAuthBase } from ".";

/** Retrieves the access token from cookies and decodes the payload into a user object. */
export async function getAuth(request: NextRequest) {
  return getAuthBase(request.cookies);
}

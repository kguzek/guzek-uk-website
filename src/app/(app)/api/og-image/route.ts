import type { NextRequest } from "next/server";

import { GET as fetchRoute } from "./[...slug]/route";

export const revalidate = 86400;

export async function GET(req: NextRequest) {
  return fetchRoute(req);
}

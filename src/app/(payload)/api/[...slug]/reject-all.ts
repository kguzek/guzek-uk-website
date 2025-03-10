import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getRequestIp } from "@/lib/util";

export function rejectAllRequests(request: NextRequest) {
  console.log(
    `requested ${request.method} ${request.nextUrl.pathname} by ${getRequestIp(request)}`,
  );
  return new NextResponse("Forbidden", { status: 403 });
}

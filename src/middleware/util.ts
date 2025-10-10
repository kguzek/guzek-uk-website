import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { User } from "@/payload-types";
import { PRODUCTION_URL } from "@/lib/constants";

export function getMiddlewareLocation(request: NextRequest, user?: User | null) {
  const segments = request.nextUrl.pathname.split("/");
  const [locale] = segments.splice(1, 1);
  const pathname = segments.join("/");

  function redirect(
    to: string,
    {
      log = true,
      absolute = false,
      includeSearch = true,
    }: { log?: boolean; absolute?: boolean; includeSearch?: boolean } = {},
  ) {
    const path = `${locale && `/${locale}`}${to}${includeSearch ? request.nextUrl.search : ""}`;
    if (log) {
      console.debug(
        "Redirecting",
        user?.username ?? "<anonymous>",
        "from",
        request.url,
        "to",
        path,
      );
    }
    return NextResponse.redirect(
      absolute ? new URL(`${PRODUCTION_URL}${path}`) : new URL(path, request.url),
    );
  }

  return { locale, pathname, redirect };
}

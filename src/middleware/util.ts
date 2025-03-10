import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { User } from "@/payload-types";

export function getMiddlewareLocation(request: NextRequest, user?: User | null) {
  const segments = request.nextUrl.pathname.split("/");
  const [locale] = segments.splice(1, 1);
  const pathname = segments.join("/");

  function redirect(to: string, log = true) {
    if (log) {
      console.debug(
        "Redirecting",
        user?.username ?? "<anonymous>",
        "from",
        request.url,
        "to",
        to,
      );
    }
    return NextResponse.redirect(new URL(`${locale && "/"}${locale}${to}`, request.url));
  }

  return { locale, pathname, redirect };
}

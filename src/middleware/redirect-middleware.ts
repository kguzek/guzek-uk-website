import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { MiddlewareFactory } from "@/lib/types";

export const redirectMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    const requestHeaders = await headers();
    const host = requestHeaders.get("host");
    if (host === "guzek.uk") {
      return NextResponse.redirect(
        new URL(
          "https://www.guzek.uk" +
            request.nextUrl.pathname +
            request.nextUrl.search,
        ),
      );
    }
    return next(request);
  };

import { NextResponse } from "next/server";
import type { MiddlewareFactory } from "@/lib/types";

export const redirectMiddleware: MiddlewareFactory = (next) =>
  function (request) {
    console.log(request.nextUrl.href, request.nextUrl.hostname);
    if (request.nextUrl.hostname === "guzek.uk") {
      return NextResponse.redirect(
        new URL("https://www.guzek.uk" + request.nextUrl.pathname),
      );
    }
    return next(request);
  };

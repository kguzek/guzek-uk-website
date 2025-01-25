import { NextResponse } from "next/server";
import type { MiddlewareFactory } from "@/lib/types";

export const redirectMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    if (request.nextUrl.host === "guzek.uk") {
      return NextResponse.redirect(
        new URL("https://www.guzek.uk" + request.nextUrl.pathname),
      );
    }
    return next(request);
  };

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "@/lib/types";
import { PRODUCTION_URL } from "@/lib/constants";

import { getMiddlewareLocation } from "./util";

export const redirectMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    const { locale, pathname } = getMiddlewareLocation(request);

    const redirect = () =>
      NextResponse.redirect(
        new URL(
          `${PRODUCTION_URL}${locale && "/"}${locale}${pathname}${request.nextUrl.search}`,
        ),
      );

    const requestHeaders = await headers();
    const host = requestHeaders.get("host") ?? "";
    if (["guzek.uk", "konrad.s.solvro.pl"].includes(host)) {
      return redirect();
    }
    if (
      host.endsWith(".guzek.uk") &&
      request.nextUrl.protocol === "http:" &&
      process.env.NODE_ENV !== "development"
    ) {
      return redirect();
    }
    return next(request);
  };

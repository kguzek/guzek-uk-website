import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { MiddlewareFactory } from "@/lib/types";

export const redirectMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    const redirect = () =>
      NextResponse.redirect(
        new URL(
          "https://www.guzek.uk" +
            request.nextUrl.pathname +
            request.nextUrl.search,
        ),
      );

    const requestHeaders = await headers();
    const host = requestHeaders.get("host") ?? "";
    if (["guzek.uk", "konrad.s.solvro.pl"].includes(host)) {
      console.log(
        "Redirecting request to www subdomain at",
        request.nextUrl.href,
      );
      return redirect();
    }
    if (
      host.endsWith(".guzek.uk") &&
      request.nextUrl.protocol === "http:" &&
      process.env.NODE_ENV !== "development"
    ) {
      console.log("Redirecting request to HTTPS at", request.nextUrl.href);
      return redirect();
    }
    return next(request);
  };

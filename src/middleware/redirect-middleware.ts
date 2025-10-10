import { headers } from "next/headers";

import type { MiddlewareFactory } from "@/lib/types";

import { getMiddlewareLocation } from "./util";

export const redirectMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    const { redirect, pathname } = getMiddlewareLocation(request);

    const requestHeaders = await headers();
    const host = requestHeaders.get("host") ?? "";
    if (["guzek.uk", "konrad.s.solvro.pl"].includes(host)) {
      return redirect(pathname, { absolute: true });
    }
    if (
      host.endsWith(".guzek.uk") &&
      request.nextUrl.protocol === "http:" &&
      process.env.NODE_ENV !== "development"
    ) {
      return redirect(pathname, { absolute: true });
    }

    const search = request.nextUrl.searchParams.get("search");
    if (pathname === "/liveseries/search" && search != null) {
      return redirect(`/liveseries/search/${search}/1`, { includeSearch: false });
    }
    return next(request);
  };

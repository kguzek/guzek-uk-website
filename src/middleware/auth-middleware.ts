import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "@/lib/types";
import { getAuth } from "@/lib/providers/auth-provider";

const ROUTES_REQUIRING_AUTH = [
  "/profile",
  "/admin-legacy",
  "/liveseries/watch",
];
const ROUTES_REQUIRING_NOAUTH = ["/login", "/signup"];
const ROUTES_REQUIRING_ADMIN = ["/admin-legacy"];

export const authMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    function redirect(to: string) {
      console.debug(
        "Redirecting",
        user?.username ?? "<anonymous>",
        "from",
        request.url,
        "to",
        to,
      );
      return NextResponse.redirect(new URL(to, request.url));
    }

    const response = await next(request);
    const { user } = await getAuth(request, response);
    const [redirectFrom, redirectTo] =
      user == null
        ? [ROUTES_REQUIRING_AUTH, "/login"]
        : [ROUTES_REQUIRING_NOAUTH, "/profile"];
    for (const route of redirectFrom) {
      if (request.nextUrl.pathname.startsWith(route)) {
        return redirect(redirectTo);
      }
    }
    if (!user?.admin) {
      for (const route of ROUTES_REQUIRING_ADMIN) {
        if (request.nextUrl.pathname.startsWith(route)) {
          return redirect("/error/403");
        }
      }
    }
    return response;
  };

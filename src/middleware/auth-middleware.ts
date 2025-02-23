import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "@/lib/types";
import { PAGINATED_REGEX_INVALID } from "@/lib/constants";
import { getAuth } from "@/lib/providers/auth-provider";

const ROUTES_REQUIRING_AUTH = ["/profile", "/admin-legacy", "/liveseries/watch"];
const ROUTES_REQUIRING_NOAUTH = ["/login", "/signup", "/verify-email", "/reset-password"];
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
    if (user?.role !== "admin") {
      for (const route of ROUTES_REQUIRING_ADMIN) {
        if (request.nextUrl.pathname.startsWith(route)) {
          return redirect("/error/403");
        }
      }
    }

    // redirect to first page of liveseries/search/:query and liveseries/most-popular if the page is invalid or missing
    const match = PAGINATED_REGEX_INVALID.exec(request.nextUrl.pathname);
    if (match != null) {
      return redirect(`${match[1]}/1`);
    }
    return response;
  };

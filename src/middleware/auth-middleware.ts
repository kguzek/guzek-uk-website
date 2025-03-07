import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "@/lib/types";
import type { User } from "@/payload-types";
import { PAGINATED_REGEX_INVALID } from "@/lib/constants";
import { getUser } from "@/lib/providers/auth-provider/api";

const ROUTES_REQUIRING_AUTH = ["/profile", "/admin-logs", "/liveseries/watch"];
const ROUTES_REQUIRING_NOAUTH = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];
const ROUTES_REQUIRING_ADMIN = ["/admin-logs"];

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
    let user: User | null = null;
    try {
      user = await getUser(request, response);
    } catch (error) {
      console.warn("Error fetching user at middleware level:", (error as Error).message);
    }
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

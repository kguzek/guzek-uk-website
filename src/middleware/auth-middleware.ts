import type { MiddlewareFactory } from "@/lib/types";
import type { User } from "@/payload-types";
import { getUser } from "@/lib/providers/auth-provider/api";

import { getMiddlewareLocation } from "./util";

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
    const response = await next(request);
    let user: User | null = null;
    try {
      user = await getUser(request, response);
    } catch (error) {
      console.warn("Error fetching user at middleware level:", (error as Error).message);
    }
    const { pathname, redirect } = getMiddlewareLocation(request, user);

    const [redirectFrom, redirectTo] =
      user == null
        ? [ROUTES_REQUIRING_AUTH, `/login?from=${encodeURIComponent(pathname)}`]
        : [ROUTES_REQUIRING_NOAUTH, "/profile"];
    for (const route of redirectFrom) {
      if (pathname.startsWith(route)) {
        return redirect(redirectTo);
      }
    }
    if (user?.role !== "admin") {
      for (const route of ROUTES_REQUIRING_ADMIN) {
        if (pathname.startsWith(route)) {
          return redirect("/error/403");
        }
      }
    }
    return response;
  };

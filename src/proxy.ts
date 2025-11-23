import { NextResponse } from "next/server";

import type { CustomMiddleware, MiddlewareFactory } from "@/lib/types";
import { authMiddleware } from "@/middleware/auth-middleware";
import { headerMiddleware } from "@/middleware/header-middleware";
import { redirectMiddleware } from "@/middleware/redirect-middleware";

import { i18nMiddleware } from "./middleware/i18n-middleware";
import { rateLimitMiddleware } from "./middleware/rate-limit-middleware";
import { verifyEmailMiddlware } from "./middleware/verify-email-middleware";

function stackProxies(...factories: MiddlewareFactory[]): CustomMiddleware {
  const current = factories.shift();
  if (!current) return () => NextResponse.next();
  const next = stackProxies(...factories);
  return current(next);
}

export default stackProxies(
  rateLimitMiddleware({ maxRequests: 200 }),
  rateLimitMiddleware({
    // Matches all server action calls (i.e. user creation, password reset)
    matcher: (request) =>
      request.method.toUpperCase() === "POST" &&
      !request.nextUrl.pathname.startsWith("/admin/"),
    maxRequests: 10,
    windowMs: 30 * 60 * 1000,
  }),
  headerMiddleware,
  redirectMiddleware,
  verifyEmailMiddlware,
  authMiddleware,
  i18nMiddleware, // This needs to be the last middleware because it doesn't call next(request)
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - [slug].png (all .png files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|[^/]+.png).*)",
  ],
  runtime: "nodejs",
};

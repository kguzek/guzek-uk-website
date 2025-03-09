import { NextResponse } from "next/server";

import type { CustomMiddleware, MiddlewareFactory } from "@/lib/types";
import { authMiddleware } from "@/middleware/auth-middleware";
import { headerMiddleware } from "@/middleware/header-middleware";
import { languageMiddleware } from "@/middleware/language-middleware";
import { redirectMiddleware } from "@/middleware/redirect-middleware";

import { rateLimitMiddleware } from "./middleware/rate-limit-middleware";
import { verifyEmailMiddlware } from "./middleware/verify-email-middleware";

function stackMiddlewares(...factories: MiddlewareFactory[]): CustomMiddleware {
  const current = factories.shift();
  if (!current) return () => NextResponse.next();
  const next = stackMiddlewares(...factories);
  return current(next);
}

export default stackMiddlewares(
  rateLimitMiddleware(),
  rateLimitMiddleware({
    // Matches all server action calls (i.e. user creation, password reset)
    matcher: (request) => request.method.toUpperCase() === "POST",
    maxRequests: 10,
    windowMs: 30 * 60 * 1000,
  }),
  headerMiddleware,
  redirectMiddleware,
  verifyEmailMiddlware,
  authMiddleware,
  languageMiddleware,
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

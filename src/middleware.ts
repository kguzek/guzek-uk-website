import { NextResponse } from "next/server";

import type { CustomMiddleware, MiddlewareFactory } from "@/lib/types";
import { authMiddleware } from "@/middleware/auth-middleware";
import { headerMiddleware } from "@/middleware/header-middleware";
import { redirectMiddleware } from "@/middleware/redirect-middleware";

import { i18nMiddleware } from "./middleware/i18n-middleware";

function stackMiddlewares(...factories: MiddlewareFactory[]): CustomMiddleware {
  const current = factories.shift();
  if (!current) return () => NextResponse.next();
  const next = stackMiddlewares(...factories);
  return current(next);
}

export default stackMiddlewares(
  headerMiddleware,
  redirectMiddleware,
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
};

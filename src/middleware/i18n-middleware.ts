import createMiddleware from "next-intl/middleware";

import type { MiddlewareFactory } from "@/lib/types";
import { PATHS_EXCLUDED_FROM_I18N } from "@/lib/constants";

import { routing } from "../i18n/routing";

const middleware = createMiddleware(routing);

export const i18nMiddleware: MiddlewareFactory = (next) => (request) => {
  const pathname = request.nextUrl.pathname;
  if (
    PATHS_EXCLUDED_FROM_I18N.find(
      (path) => path === pathname || pathname.startsWith(`${path}/`),
    )
  ) {
    return next(request);
  }
  return middleware(request);
};

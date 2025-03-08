import createMiddleware from "next-intl/middleware";

import type { MiddlewareFactory } from "@/lib/types";

import { routing } from "../i18n/routing";

export const i18nMiddleware: MiddlewareFactory = () => createMiddleware(routing);

// export const config = {
//   // Match only internationalized pathnames
//   matcher: ["/", "/(en|pl)(?:-[a-zA-Z]{2})?/:path*"],
// };

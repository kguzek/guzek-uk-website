import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "@/lib/types";
import { Language } from "@/lib/enums";
import { getLanguageCookieOptions } from "@/lib/util";

export const languageMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    for (const language of Object.keys(Language)) {
      const slug = `/${language.toLowerCase()}`;
      if (request.nextUrl.pathname.startsWith(slug)) {
        const path = request.nextUrl.pathname.replace(slug, "") || "/";
        const url = new URL(path, request.url);
        const response = NextResponse.redirect(url);
        response.cookies.set(
          "lang",
          language.toUpperCase(),
          getLanguageCookieOptions(),
        );
        return response;
      }
    }
    return next(request);
  };

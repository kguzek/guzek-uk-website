import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "@/lib/types";
import { Language } from "@/lib/enums";
import { getCookieOptions } from "@/lib/util";

export const languageMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    for (const language of Object.keys(Language)) {
      const slug = `/${language.toLowerCase()}`;
      if (request.nextUrl.pathname.startsWith(slug)) {
        const path = request.nextUrl.pathname.replace(slug, "") || "/";
        const url = new URL(path, request.url);
        const response = NextResponse.redirect(url);
        response.cookies.set("lang", language.toUpperCase(), getCookieOptions());
        return response;
      }
    }
    const response = await next(request);
    if (!request.cookies.get("lang")) {
      response.cookies.set("lang", Language.EN, getCookieOptions());
    }
    return response;
  };

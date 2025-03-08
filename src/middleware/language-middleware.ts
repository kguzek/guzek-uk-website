import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "@/lib/types";
import { Language } from "@/lib/enums";
import { getCookieOptions } from "@/lib/util";

export const languageMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    const firstSegment = request.nextUrl.pathname.split("/").at(1);
    console.log({ firstSegment });
    if (firstSegment != null) {
      for (const language of Object.keys(Language)) {
        if (firstSegment === language.toLowerCase()) {
          const path = request.nextUrl.pathname.replace(`/${firstSegment}`, "") || "/";
          const url = new URL(path, request.url);
          const response = NextResponse.redirect(url);
          response.cookies.set("lang", language.toUpperCase(), getCookieOptions());
          return response;
        }
      }
    }
    const response = await next(request);
    if (!request.cookies.get("lang")) {
      response.cookies.set("lang", Language.EN, getCookieOptions());
    }
    return response;
  };

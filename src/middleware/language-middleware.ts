import { Language } from "@/lib/enums";
import { MiddlewareFactory } from "@/lib/types";
import { getLanguageCookieOptions } from "@/lib/util";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const languageMiddleware: MiddlewareFactory = (next) =>
  async function (request) {
    const cookieStore = await cookies();
    for (const language of Object.keys(Language)) {
      const slug = `/${language.toLowerCase()}`;
      if (request.nextUrl.pathname.startsWith(slug)) {
        cookieStore.set(
          "lang",
          language.toUpperCase(),
          getLanguageCookieOptions(),
        );
        const path = request.nextUrl.pathname.replace(slug, "") || "/";
        const url = new URL(path, request.url);
        return NextResponse.redirect(url);
      }
    }
    return next(request);
  };

import { getPayload } from "payload";
import config from "@payload-config";

import type { MiddlewareFactory } from "@/lib/types";
import { EMAIL_VERIFICATION_COOKIE } from "@/lib/constants";

import { getMiddlewareLocation } from "./util";

export const verifyEmailMiddlware: MiddlewareFactory = (next) => async (request) => {
  const { pathname, redirect } = getMiddlewareLocation(request);

  if (pathname !== "/verify-email") {
    return next(request);
  }
  const payload = await getPayload({ config });

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return redirect("/error/400?message=Missing%20token");
  }
  let errorMessage: string | null = "Invalid verification token";
  try {
    const success = await payload.verifyEmail({
      collection: "users",
      token,
    });
    if (success) {
      errorMessage = null;
    }
  } catch (error) {
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    } else {
      console.error("Unknown error verifying email:", error);
    }
  }
  if (errorMessage != null) {
    return redirect(`/error/400?message=${errorMessage}`);
  }
  const response = redirect("/login?from=verify-email");
  response.cookies.delete(EMAIL_VERIFICATION_COOKIE);
  return response;
};

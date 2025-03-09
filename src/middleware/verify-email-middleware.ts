import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

import type { MiddlewareFactory } from "@/lib/types";
import { EMAIL_VERIFICATION_COOKIE } from "@/lib/constants";

export const verifyEmailMiddlware: MiddlewareFactory = (next) => async (request) => {
  if (request.nextUrl.pathname !== "/verify-email") {
    return next(request);
  }
  const payload = await getPayload({ config });

  const redirect = (to: string) => NextResponse.redirect(new URL(to, request.url));

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
    // const response = await fetchFromApi<ApiMessage>(`users/verify/${token}`, {
    //   method: "POST",
    // });
    // if (response.data.message === "Email verified successfully.") {
    //   errorMessage = null;
    // }
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

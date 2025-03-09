"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { validateTurnstileToken } from "next-turnstile";

import type { ForgotPasswordSchema, SignUpSchema } from "@/lib/backend/schemas";
import { TURNSTILE_SECRET_KEY } from "@/lib/constants";

export async function createNewUser({ token, ...data }: SignUpSchema) {
  if (!TURNSTILE_SECRET_KEY) {
    throw new Error("TURNSTILE_SECRET_KEY is not set");
  }
  const verifyResult = await validateTurnstileToken({
    token,
    secretKey: TURNSTILE_SECRET_KEY,
  });

  if (!verifyResult.success) {
    throw new Error(
      `Token validation failed: ${verifyResult.error_codes?.join(", ") ?? "Unknown error"}`,
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.create({
    collection: "users",
    data: {
      ...data,
      role: "user",
      userShows: { liked: [], subscribed: [] },
      watchedEpisodes: {},
    },
  });

  return result;
}

export async function forgotPassword(data: ForgotPasswordSchema) {
  const payload = await getPayload({ config });
  const result = await payload.forgotPassword({
    collection: "users",
    data,
  });
  return result.length > 0;
}

import { redirect } from "next/navigation";

import { ErrorComponent } from "@/components/error/component";
import { ErrorCode } from "@/lib/enums";

import type { PropsWithToken } from "../with-token";
import { withToken } from "../with-token";

export default async function VerifyEmail({ searchParams }: PropsWithToken) {
  const { error, token, payload } = await withToken({ searchParams });
  if (error != null) {
    return error;
  }
  let success;
  try {
    success = await payload.verifyEmail({ collection: "users", token });
  } catch (error) {
    success = false;
    if (error instanceof Error) {
      console.warn("Error verifying email:", error.name, error.message);
    } else {
      console.error("Unknown error verifying email:", error);
    }
  }
  if (!success) {
    return (
      <ErrorComponent errorCode={ErrorCode.BadRequest} errorMessage="Invalid token" />
    );
  }
  redirect("/login?from=verify-email");
}

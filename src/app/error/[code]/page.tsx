"use client";

import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/types";
export default function ErrorPage({
  params: { code: errorCode },
}: {
  params: { code: ErrorCode };
}) {
  return <ErrorComponent errorCode={errorCode} />;
}

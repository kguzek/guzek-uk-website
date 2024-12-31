"use client";

import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/types";
export default async function ErrorPage({
  params,
}: {
  params: Promise<{ code: ErrorCode }>;
}) {
  const { code: errorCode } = await params;
  return <ErrorComponent errorCode={errorCode} />;
}

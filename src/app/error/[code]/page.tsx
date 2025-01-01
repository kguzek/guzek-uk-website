import { ErrorComponent } from "@/components/error-component";
import type { ErrorCode } from "@/lib/enums";
export default async function ErrorPage({
  params,
}: {
  params: Promise<{ code: ErrorCode }>;
}) {
  const { code: errorCode } = await params;
  return <ErrorComponent errorCode={errorCode} />;
}

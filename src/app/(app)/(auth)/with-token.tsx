import { getPayload } from "payload";
import config from "@payload-config";

import { ErrorComponent } from "@/components/error/component";
import { ErrorCode } from "@/lib/enums";

export interface PropsWithToken {
  searchParams: Promise<{ token?: string }>;
}

export async function withToken({ searchParams }: PropsWithToken) {
  const { token } = await searchParams;
  if (!token) {
    return {
      error: (
        <ErrorComponent errorCode={ErrorCode.BadRequest} errorMessage="Missing token" />
      ),
    };
  }
  const payload = await getPayload({ config });
  return { error: null, token, payload };
}

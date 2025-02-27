import type { ReactNode } from "react";
import Link from "next/link";

import type { Translation } from "@/lib/translations";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";
import { TRANSLATIONS } from "@/lib/translations";
import { PAGE_NAME } from "@/lib/util";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

import { Tile } from "../tile";

const serialiseError = (error: ErrorCode, data: Translation = TRANSLATIONS.EN) =>
  `${error} ${data.error[error].title}`;

export async function ErrorComponent({
  errorCode,
  errorMessage,
  errorResult,
  path,
}: (
  | { errorCode: ErrorCode; errorResult?: never }
  | {
      errorCode?: never;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorResult: { ok: boolean; error: any; hasBody: boolean; data: any };
    }
) & { errorMessage?: ReactNode; path?: string }) {
  const { data } = await getTranslations();
  if (!errorCode) {
    if (!errorResult)
      throw new Error("ErrorComponent called with no errorCode or errorResult");
    if (errorResult.ok) throw new Error("ErrorComponent called with ok result");
    if (!errorResult.hasBody) errorCode = ErrorCode.ServerError;
    else if (serialiseError(ErrorCode.NotFound) in errorResult.error)
      errorCode = ErrorCode.NotFound;
    else errorCode = ErrorCode.Forbidden;
  }
  return (
    <div className="grid justify-center">
      <h3 className="my-5 flex items-center gap-2 text-3xl font-bold">
        {data.error[errorCode].title}
        {path ? (
          <Badge variant="outline" className="mx-1 py-1 font-mono">
            {path}
          </Badge>
        ) : null}
      </h3>
      <Tile>
        <div className="sm:min-w-sm">
          <h1 className="my-2 text-3xl font-extrabold">
            {errorCode} {data.error[errorCode].title}
          </h1>
          {errorMessage ? (
            typeof errorMessage === "string" ? (
              <p>{decodeURIComponent(errorMessage)}</p>
            ) : (
              errorMessage
            )
          ) : (
            <p>{data.error[errorCode].body}.</p>
          )}
          <Button className="mt-10 w-full" asChild>
            {errorCode === ErrorCode.Unauthorized ? (
              <Link href="/login" className="btn">
                {data.profile.formDetails.login}
              </Link>
            ) : (
              <Link href="/" className="btn">
                {PAGE_NAME}
              </Link>
            )}
          </Button>
        </div>
      </Tile>
    </div>
  );
}

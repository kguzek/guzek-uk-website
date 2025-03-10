import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { ErrorCode } from "@/lib/enums";
import { PAGE_NAME } from "@/lib/util";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

import { ClientLink } from "../link/client";
import { Tile } from "../tile";

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
  const t = await getTranslations();

  const serialiseError = (error: ErrorCode) => `${error} ${t(`error.${error}.title`)}`;

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
        {t(`error.${errorCode}.title`)}
        {path ? (
          <Badge variant="outline" className="mx-1 py-1 font-mono">
            {decodeURIComponent(path)}
          </Badge>
        ) : null}
      </h3>
      <Tile glow>
        <div className="sm:min-w-sm">
          <h1 className="my-2 text-3xl font-extrabold">
            {errorCode} {t(`error.${errorCode}.title`)}
          </h1>
          {errorMessage ? (
            typeof errorMessage === "string" ? (
              <p>{decodeURIComponent(errorMessage)}</p>
            ) : (
              errorMessage
            )
          ) : (
            <p>{t(`error.${errorCode}.body`)}.</p>
          )}
          <Button className="mt-10 w-full" asChild>
            {errorCode === ErrorCode.Unauthorized ? (
              <ClientLink href="/login" className="btn">
                {t("profile.formDetails.login")}
              </ClientLink>
            ) : (
              <ClientLink href="/" className="btn">
                {PAGE_NAME}
              </ClientLink>
            )}
          </Button>
        </div>
      </Tile>
    </div>
  );
}

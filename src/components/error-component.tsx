import Link from "next/link";
import { ErrorCode } from "@/lib/enums";
import { PAGE_NAME } from "@/lib/util";
import { Translation, TRANSLATIONS } from "@/lib/translations";
import { useTranslations } from "@/providers/translation-provider";
import { ReactNode } from "react";

const serialiseError = (
  error: ErrorCode,
  data: Translation = TRANSLATIONS.EN,
) => `${error} ${data.error[error].title}`;

export async function ErrorComponent({
  errorCode,
  errorMessage,
  errorResult,
}: (
  | { errorCode: ErrorCode; errorResult?: never }
  | {
      errorCode?: never;
      errorResult: { ok: boolean; error: any; hasBody: boolean; data: any };
    }
) & { errorMessage?: ReactNode }) {
  const { data } = await useTranslations();
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
    <div className="text">
      <h3 className="my-5 text-2xl font-bold">
        {errorCode} {data.error[errorCode].title}
      </h3>
      <h1 className="my-2 text-4xl font-extrabold">{errorCode}</h1>
      {errorMessage ? (
        typeof errorMessage === "string" ? (
          <p>{decodeURIComponent(errorMessage)}</p>
        ) : (
          errorMessage
        )
      ) : (
        <p>{data.error[errorCode].body}</p>
      )}
      <div className="mt-3 flex justify-center">
        <div className="link-container">
          {errorCode === ErrorCode.Unauthorized ? (
            <Link href="/login" className="btn">
              {data.profile.formDetails.login}
            </Link>
          ) : (
            <Link href="/" className="btn">
              {PAGE_NAME}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

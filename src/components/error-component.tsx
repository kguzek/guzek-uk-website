"use client";

import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { ErrorCode } from "@/lib/types";
import { PAGE_NAME } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";

export function ErrorComponent({ errorCode }: { errorCode: ErrorCode }) {
  const { data } = useTranslations();
  return (
    <div className="text">
      <PageTitle title={`${errorCode} ${data.error[errorCode].title}`} />
      <h1>{errorCode}</h1>
      <p>{data.error[errorCode].body}</p>
      <div className="flex-column">
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

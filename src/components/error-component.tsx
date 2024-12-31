"use client";

import Link from "next/link";
import Head from "next/head";
import { ErrorCode } from "@/lib/types";
import { PAGE_NAME, getTitle } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";

export function ErrorComponent({ errorCode }: { errorCode: ErrorCode }) {
  const { data } = useTranslations();
  return (
    <div className="text">
      <Head>
        <title>{getTitle(`${errorCode} ${data.error[errorCode].title}`)}</title>
      </Head>
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

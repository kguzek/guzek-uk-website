"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorCode } from "@/lib/models";
import { PAGE_NAME, setTitle } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";

export default function ErrorPage({ errorCode }: { errorCode: ErrorCode }) {
  const { data } = useTranslations();

  useEffect(() => {
    setTitle(`${errorCode} ${data.error[errorCode].title}`);
  }, [data]);

  return (
    <div className="text">
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

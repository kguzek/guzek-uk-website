"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Language } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import { TRANSLATIONS } from "@/lib/translations";
import { getEmailClientInfo } from "@/lib/util";

const ENABLE_LOGIN_BUTTON_AFTER_MS = 3000;

export function EmailPrompt({
  userLanguage,
  email,
}: {
  userLanguage: Language;
  email: string;
}) {
  const [loginButtonDisabled, setLoginButtonDisabled] = useState(true);
  const emailClientInfo = getEmailClientInfo(email);
  const data = TRANSLATIONS[userLanguage];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoginButtonDisabled(false);
    }, ENABLE_LOGIN_BUTTON_AFTER_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <div className="grid max-w-xs gap-4">
        <h1 className="text-xl font-bold">
          {data.profile.formDetails.verifyEmail.header}
        </h1>
        <div className="grid gap-2 text-sm">
          <p>{data.profile.formDetails.verifyEmail.info(email)}</p>
          <p>{data.profile.formDetails.verifyEmail.cta}</p>
        </div>
      </div>
      {emailClientInfo ? (
        <Button asChild variant="ghost">
          <Link href={emailClientInfo.url} target="_blank">
            {emailClientInfo.label}
          </Link>
        </Button>
      ) : (
        <Button
          asChild
          disabled={loginButtonDisabled}
          variant={loginButtonDisabled ? "disabled" : "ghost"}
        >
          <Link href="/login">{data.profile.formDetails.login}</Link>
        </Button>
      )}
    </>
  );
}

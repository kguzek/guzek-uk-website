"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { getEmailClientInfo } from "@/lib/util";

const ENABLE_LOGIN_BUTTON_AFTER_MS = 3000;

export function EmailPrompt({ email }: { email: string }) {
  const t = useTranslations();
  const [loginButtonDisabled, setLoginButtonDisabled] = useState(true);
  const emailClientInfo = getEmailClientInfo(email);

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
          {t("profile.formDetails.verifyEmail.header")}
        </h1>
        <div className="grid gap-2 text-sm">
          <p>{t("profile.formDetails.verifyEmail.info", { email })}</p>
          <p>{t("profile.formDetails.verifyEmail.cta")}</p>
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
          <Link href="/login">{t("profile.formDetails.login")}</Link>
        </Button>
      )}
    </>
  );
}

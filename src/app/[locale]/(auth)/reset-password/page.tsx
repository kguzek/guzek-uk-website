import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Tile } from "@/components/tile";
import { Button } from "@/components/ui/button";

import type { PropsWithToken } from "../with-token";
import { withToken } from "../with-token";
import { ResetPasswordForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("profile.formDetails.resetPassword.header"),
  };
}

export default async function ResetPassword({ searchParams }: PropsWithToken) {
  const { error, token } = await withToken({ searchParams });
  if (error != null) {
    return error;
  }
  const t = await getTranslations();
  return (
    <div className="mt-10 flex justify-center">
      <Tile variant="form">
        <h1 className="text-xl font-bold">
          {t("profile.formDetails.resetPassword.header")}
        </h1>
        <ResetPasswordForm token={token} />
        <p className="text-sm">{t("profile.formDetails.or")}</p>
        <Button asChild variant="ghost">
          <Link href="/login">{t("profile.formDetails.login")}</Link>
        </Button>
      </Tile>
    </div>
  );
}

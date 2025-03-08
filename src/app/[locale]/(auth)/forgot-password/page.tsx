import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Tile } from "@/components/tile";

import { ForgotPasswordForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("profile.formDetails.forgotPassword.header"),
  };
}

export default async function ForgotPassword() {
  const t = await getTranslations();

  return (
    <div className="mt-10 flex justify-center">
      <Tile variant="form">
        <h1 className="text-xl font-bold">
          {t("profile.formDetails.resetPassword.header")}
        </h1>
        <ForgotPasswordForm />
      </Tile>
    </div>
  );
}

import type { Metadata } from "next";

import { Tile } from "@/components/tile";
import { getTranslations } from "@/lib/providers/translation-provider";

import { ForgotPasswordForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: data.profile.formDetails.forgotPassword.header,
  };
}

export default async function ForgotPassword() {
  const { data, userLanguage } = await getTranslations();
  return (
    <div className="mt-10 flex justify-center">
      <Tile variant="form">
        <h1 className="text-xl font-bold">
          {data.profile.formDetails.resetPassword.header}
        </h1>
        <ForgotPasswordForm userLanguage={userLanguage} />
      </Tile>
    </div>
  );
}

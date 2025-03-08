import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Tile } from "@/components/tile";
import { getAuth } from "@/lib/providers/auth-provider";
import { getPendingEmailAddress } from "@/lib/providers/email-verification-provider";

import { EmailPrompt } from "./email-prompt";
import { SignUpForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("profile.formDetails.signup"),
  };
}

export default async function SignUp() {
  const { user } = await getAuth();
  if (user) return null;
  const email = await getPendingEmailAddress();
  return (
    <div className="mt-10 flex justify-center">
      <Tile variant="form" className="max-w-full" containerClassName="max-w-full">
        {email ? <EmailPrompt email={email} /> : <SignUpForm />}
      </Tile>
    </div>
  );
}

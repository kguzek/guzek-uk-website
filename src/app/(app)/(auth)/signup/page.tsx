import type { Metadata } from "next";

import { Tile } from "@/components/tile";
import { getAuth } from "@/lib/providers/auth-provider";
import { getPendingEmailAddress } from "@/lib/providers/email-verification-provider";
import { getTranslations } from "@/lib/providers/translation-provider";

import { EmailPrompt } from "./email-prompt";
import { SignUpForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: data.profile.formDetails.signup,
  };
}

export default async function SignUp() {
  const { userLanguage } = await getTranslations();
  const { user } = await getAuth();
  if (user) return null;
  const email = await getPendingEmailAddress();
  return (
    <div className="mt-10 flex justify-center">
      <Tile variant="form" className="max-w-full" containerClassName="max-w-full">
        {email ? (
          <EmailPrompt userLanguage={userLanguage} email={email} />
        ) : (
          <SignUpForm userLanguage={userLanguage} />
        )}
      </Tile>
    </div>
  );
}

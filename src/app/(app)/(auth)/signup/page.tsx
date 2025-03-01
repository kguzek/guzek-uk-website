import type { Metadata } from "next";

import { Tile } from "@/components/tile";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle } from "@/lib/util";

import { SignUpForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.profile.formDetails.signup),
  };
}

export default async function SignUp() {
  const { userLanguage } = await getTranslations();
  const { user } = await getAuth();
  if (user) return null;
  return (
    <div className="mt-10 flex justify-center">
      <Tile variant="form">
        <SignUpForm userLanguage={userLanguage} />
      </Tile>
    </div>
  );
}

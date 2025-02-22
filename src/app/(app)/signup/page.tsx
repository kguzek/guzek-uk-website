import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
  const { data, userLanguage } = await getTranslations();
  const { user } = await getAuth();
  if (user) return null;
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <SignUpForm userLanguage={userLanguage} />
      <p className="mt-3">{data.profile.formDetails.haveAccountAlready}</p>
      <Button asChild variant="ghost">
        <Link href="/login">{data.profile.formDetails.login}</Link>
      </Button>
    </div>
  );
}

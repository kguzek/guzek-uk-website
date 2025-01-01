import type { Metadata } from "next";
import Link from "next/link";
import { getTitle } from "@/lib/util";
import { useTranslations } from "@/providers/translation-provider";
import { getCurrentUser } from "@/providers/auth-provider";
import { SignUpForm } from "./signup-form";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await useTranslations();
  return {
    title: getTitle(data.profile.formDetails.signup),
  };
}

export default async function SignUp() {
  const { data, userLanguage } = await useTranslations();
  const user = await getCurrentUser();
  if (user) return null;
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <SignUpForm userLanguage={userLanguage} />
      <p className="mt-3">{data.profile.formDetails.haveAccountAlready}</p>
      <Link href="/login">
        <i>{data.profile.formDetails.login}</i>
      </Link>
    </div>
  );
}

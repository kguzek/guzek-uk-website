import type { Metadata } from "next";
import Link from "next/link";
import { getTitle } from "@/lib/util";
import { useTranslations } from "@/providers/translation-provider";
import { getCurrentUser } from "@/lib/backend/user";
import { LogInForm } from "./form";
import { PageSkeleton } from "@/components/pages/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await useTranslations();
  return {
    title: getTitle(data.profile.formDetails.login),
  };
}

export default async function LogIn() {
  const { data, userLanguage } = await useTranslations();
  const user = await getCurrentUser();
  if (user) {
    console.warn("Logged in user visited /login:", user);
    return (
      <div className="text">
        <PageSkeleton />
      </div>
    );
  }
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <LogInForm userLanguage={userLanguage} />
      <p className="mt-3">{data.profile.formDetails.or}</p>
      <Link href="/signup">
        <i>{data.profile.formDetails.signup}</i>
      </Link>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { PageSkeleton } from "@/components/pages/skeleton";
import { Button } from "@/components/ui/button";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle } from "@/lib/util";

import { LogInForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.profile.formDetails.login),
  };
}

export default async function LogIn() {
  const { data, userLanguage } = await getTranslations();
  const { user } = await getAuth();
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
      <Button variant="ghost" asChild>
        <Link href="/signup">{data.profile.formDetails.signup}</Link>
      </Button>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { PageSkeleton } from "@/components/pages/skeleton";
import { Tile } from "@/components/tile";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { Button } from "@/ui/button";

import { LogInForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: data.profile.formDetails.login,
  };
}

export default async function LogIn({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
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
  const { from } = await searchParams;
  return (
    <div className="mt-10 flex justify-center">
      <Tile variant="form">
        <h1 className="text-xl font-bold">{data.profile.formDetails.login}</h1>
        <LogInForm userLanguage={userLanguage} from={from} />
        <p className="text-sm">{data.profile.formDetails.or}</p>
        <Button variant="ghost" asChild>
          <Link href="/signup">{data.profile.formDetails.signup}</Link>
        </Button>
      </Tile>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { PageSkeleton } from "@/components/pages/skeleton";
import { Tile } from "@/components/tile";
import { getAuth } from "@/lib/providers/auth-provider";
import { getPendingEmailAddress } from "@/lib/providers/email-verification-provider";
import { Button } from "@/ui/button";

import { EmailPrompt } from "../signup/email-prompt";
import { LogInForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("profile.formDetails.login"),
  };
}

export default async function LogIn({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const t = await getTranslations();
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
  const email = await getPendingEmailAddress();
  return (
    <div className="mt-10 flex justify-center">
      <Tile variant="form">
        {email ? (
          <EmailPrompt email={email} />
        ) : (
          <>
            <h1 className="text-xl font-bold">{t("profile.formDetails.login")}</h1>
            <LogInForm from={from} />
            <p className="text-sm">{t("profile.formDetails.or")}</p>
            <Button variant="ghost" asChild>
              <Link href="/signup">{t("profile.formDetails.signup")}</Link>
            </Button>
          </>
        )}
      </Tile>
    </div>
  );
}

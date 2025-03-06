import type { Metadata } from "next";
import Link from "next/link";

import { Tile } from "@/components/tile";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/providers/translation-provider";

import type { PropsWithToken } from "../with-token";
import { withToken } from "../with-token";
import { ResetPasswordForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: data.profile.formDetails.resetPassword.header,
  };
}

export default async function ResetPassword({ searchParams }: PropsWithToken) {
  const { error, token } = await withToken({ searchParams });
  if (error != null) {
    return error;
  }
  const { data, userLanguage } = await getTranslations();
  return (
    <div className="mt-10 flex justify-center">
      <Tile variant="form">
        <h1 className="text-xl font-bold">
          {data.profile.formDetails.resetPassword.header}
        </h1>
        <ResetPasswordForm userLanguage={userLanguage} token={token} />
        <p className="text-sm">{data.profile.formDetails.or}</p>
        <Button asChild variant="ghost">
          <Link href="/login">{data.profile.formDetails.login}</Link>
        </Button>
      </Tile>
    </div>
  );
}

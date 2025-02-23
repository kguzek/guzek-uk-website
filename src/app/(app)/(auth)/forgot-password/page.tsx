import Link from "next/link";

import { Tile } from "@/components/tile";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/providers/translation-provider";

import { ForgotPasswordForm } from "./form";

export default async function ForgotPassword() {
  const { data, userLanguage } = await getTranslations();
  return (
    <div className="mt-10 flex justify-center">
      <Tile className="min-w-xs">
        <h1 className="text-xl font-bold">
          {data.profile.formDetails.resetPassword.header}
        </h1>
        <ForgotPasswordForm userLanguage={userLanguage} />
        <Button variant="ghost" asChild>
          <Link href="/login">{data.profile.formDetails.login}</Link>
        </Button>
      </Tile>
    </div>
  );
}

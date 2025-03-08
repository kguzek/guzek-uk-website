import { getTranslations } from "next-intl/server";

import { TextWrapper } from "@/components/text-wrapper";
import { Tile } from "@/components/tile";
import { Badge } from "@/components/ui/badge";
import { getAuth } from "@/lib/providers/auth-provider";
import { removeUserCookie } from "@/lib/util";

import { DeleteAccountButton } from "./delete-account-button";
import { ProfileForm } from "./form";
import { LogoutButton } from "./logout-button";

export async function generateMetadata() {
  const t = await getTranslations();
  return {
    title: t("profile.title"),
  };
}

export default async function Profile() {
  const { user } = await getAuth();
  const t = await getTranslations();

  if (!user) {
    removeUserCookie();
    return <p className="text">{t("unknownError")}</p>;
  }

  return (
    <div className="text">
      <TextWrapper
        className="gap-2"
        after={
          <>
            <div className="my-4 flex flex-col gap-4 sm:flex-row-reverse">
              <LogoutButton />
              <DeleteAccountButton user={user} />
            </div>
            <Badge>{user.id}</Badge>
          </>
        }
      >
        <h2 className="my-6 text-3xl font-bold">{t("profile.title")}</h2>
        <h3 className="my-5 text-2xl font-bold">{t("profile.body")}</h3>
        <Tile variant="form" containerClassName="w-full" className="w-full">
          <ProfileForm user={user} />
        </Tile>
      </TextWrapper>
    </div>
  );
}

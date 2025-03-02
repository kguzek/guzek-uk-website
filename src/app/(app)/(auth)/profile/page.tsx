import { TextWrapper } from "@/components/text-wrapper";
import { Tile } from "@/components/tile";
import { Badge } from "@/components/ui/badge";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle, removeUserCookie } from "@/lib/util";

import { DeleteAccountButton } from "./delete-account-button";
import { ProfileForm } from "./form";
import { LogoutButton } from "./logout-button";

export async function generateMetadata() {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.profile.title),
  };
}

export default async function Profile() {
  const { user } = await getAuth();
  const { data, userLanguage } = await getTranslations();

  if (!user) {
    removeUserCookie();
    return <p className="text">{data.unknownError}</p>;
  }

  return (
    <TextWrapper
      className="gap-2"
      centered
      outer={
        <>
          <Badge>{user.id}</Badge>
          <DeleteAccountButton user={user} userLanguage={userLanguage} />
        </>
      }
    >
      <h2 className="my-6 text-3xl font-bold">{data.profile.title}</h2>
      <h3 className="my-5 text-2xl font-bold">{data.profile.body}</h3>
      <Tile variant="form">
        <ProfileForm user={user} userLanguage={userLanguage} />
        <p className="text-sm">{data.profile.formDetails.or}</p>
        <LogoutButton userLanguage={userLanguage} />
      </Tile>
    </TextWrapper>
  );
}

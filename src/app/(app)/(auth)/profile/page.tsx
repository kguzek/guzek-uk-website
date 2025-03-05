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
    <div className="text">
      <TextWrapper
        className="gap-2"
        outer={
          <>
            <div className="my-4 flex flex-col gap-4 sm:flex-row-reverse">
              <LogoutButton userLanguage={userLanguage} />
              <DeleteAccountButton user={user} userLanguage={userLanguage} />
            </div>
            <Badge>{user.id}</Badge>
          </>
        }
      >
        <h2 className="my-6 text-3xl font-bold">{data.profile.title}</h2>
        <h3 className="my-5 text-2xl font-bold">{data.profile.body}</h3>
        <Tile variant="form" containerClassName="w-full" className="w-full">
          <ProfileForm user={user} userLanguage={userLanguage} />
        </Tile>
      </TextWrapper>
    </div>
  );
}

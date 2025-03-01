import { PageSkeleton } from "@/components/pages/skeleton";
import { TextWrapper } from "@/components/text-wrapper";
import { Tile } from "@/components/tile";
import { Badge } from "@/components/ui/badge";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle } from "@/lib/util";

import { ProfileForm } from "./form";
import { LogoutButton } from "./logout-button";

export async function generateMetadata() {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.profile.title),
  };
}

export default async function Profile() {
  const { user, accessToken } = await getAuth();
  const { data, userLanguage } = await getTranslations();

  if (!user || !accessToken)
    return (
      <div className="text">
        <PageSkeleton />
      </div>
    );

  return (
    <TextWrapper className="gap-2" centered outer={<Badge>{user.id}</Badge>}>
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

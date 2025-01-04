import { NextResponse } from "next/server";
import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/enums";
import { getAccessToken } from "@/lib/backend/server";
import { getCurrentUser } from "@/lib/backend/user";
import { useTranslations } from "@/providers/translation-provider";
import Player from "./player";

function isNumber(val: string | string[] | undefined): val is string {
  return !Array.isArray(val) && val != null && `${+val}` === val && +val > 0;
}

interface Props {
  params: Promise<{ showName: string; season: string; episode: string }>;
}

export default async function Watch({ params }: Props) {
  const { userLanguage } = await useTranslations();
  const { showName, season, episode } = await params;
  if (
    Array.isArray(showName) ||
    !(showName && isNumber(season) && isNumber(episode))
  ) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect("/login");
  }
  if (!user.serverUrl) {
    return NextResponse.redirect("/profile?redirect_reason=no_server_url");
  }
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return <ErrorComponent errorCode={ErrorCode.Unauthorized} />;
  }
  return (
    <Player
      showName={showName}
      season={+season}
      episode={+episode}
      apiBase={user.serverUrl}
      accessToken={accessToken}
      userLanguage={userLanguage}
    />
  );
}

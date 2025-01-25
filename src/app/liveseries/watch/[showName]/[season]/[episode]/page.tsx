import { NextResponse } from "next/server";
import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/enums";
import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "@/providers/translation-provider";
import { Player } from "./player";

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
  const { user, accessToken } = await useAuth();
  if (!user) {
    return NextResponse.redirect("/login");
  }
  if (!user.serverUrl) {
    return NextResponse.redirect("/profile?redirect_reason=no_server_url");
  }
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

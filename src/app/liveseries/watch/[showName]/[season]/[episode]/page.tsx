import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/enums";
import { getAccessToken } from "@/lib/backend-v2";
import { getCurrentUser } from "@/providers/auth-provider";
import Player from "./player";

function isNumber(val: string | string[] | undefined): val is string {
  return !Array.isArray(val) && val != null && `${+val}` === val && +val > 0;
}

interface Props {
  params: Promise<{ showName: string; season: string; episode: string }>;
}

export default async function Watch({ params }: Props) {
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
  const accessToken = await getAccessToken(await cookies());
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
    />
  );
}

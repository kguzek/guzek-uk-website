import Link from "next/link";

import { ErrorComponent } from "@/components/error-component";
import { TextWithUrl } from "@/components/text-with-url";
import { serverToApi } from "@/lib/backend/server";
import { ErrorCode } from "@/lib/enums";
import { getAuth } from "@/providers/auth-provider";
import { getTranslations } from "@/providers/translation-provider";

import { Player } from "./player";

function isNumber(val: string | string[] | undefined): val is string {
  return !Array.isArray(val) && val != null && `${+val}` === val && +val > 0;
}

interface Props {
  params: Promise<{ showName: string; season: string; episode: string }>;
}

export default async function Watch({ params }: Props) {
  const { data, userLanguage } = await getTranslations();
  const {
    showName,
    season: seasonString,
    episode: episodeString,
  } = await params;
  if (
    Array.isArray(showName) ||
    !(showName && isNumber(seasonString) && isNumber(episodeString))
  ) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }
  const { user, accessToken } = await getAuth();
  if (!accessToken) {
    return <ErrorComponent errorCode={ErrorCode.Unauthorized} />;
  }
  if (!user.serverUrl) {
    // console.warn("User without server URL accessed /liveseries/watch");
    return (
      <ErrorComponent
        errorCode={ErrorCode.Forbidden}
        errorMessage={<TextWithUrl>{data.liveSeries.explanation}</TextWithUrl>}
      />
    );
  }

  const season = +seasonString;
  const episode = +episodeString;

  const statResult = await serverToApi(
    `liveseries/video/${showName}/${season}/${episode}`,
    { headers: { Range: "bytes=0-1" } },
  );

  const episodeObject = { episode, season };

  return (
    <div>
      <h2 className="my-6 text-3xl font-bold">
        {decodeURIComponent(showName)}{" "}
        {data.liveSeries.episodes.serialise(episodeObject)}
      </h2>
      <div className="mb-2 flex flex-col items-center text-sm sm:text-xl md:flex-row md:items-start">
        <div className="flex gap-3">
          {season > 1 && (
            <>
              <Link href={`/liveseries/watch/${showName}/${season - 1}/1`}>
                {data.liveSeries.watch.previous} {data.liveSeries.tvShow.season}
              </Link>
              |
            </>
          )}
          <Link href={`/liveseries/watch/${showName}/${season + 1}/1`}>
            {data.liveSeries.watch.next} {data.liveSeries.tvShow.season}
          </Link>
        </div>
        <span className="mx-3 hidden md:block">|</span>
        <div className="flex gap-3">
          {episode > 1 && (
            <>
              <Link
                href={`/liveseries/watch/${showName}/${season}/${episode - 1}`}
              >
                {data.liveSeries.watch.previous}{" "}
                {data.liveSeries.tvShow.episode}
              </Link>
              |
            </>
          )}
          <Link href={`/liveseries/watch/${showName}/${season}/${episode + 1}`}>
            {data.liveSeries.watch.next} {data.liveSeries.tvShow.episode}
          </Link>
        </div>
      </div>
      {statResult.ok ? (
        <Player
          showName={showName}
          season={season}
          episode={episode}
          apiBase={user.serverUrl}
          accessToken={accessToken}
          userLanguage={userLanguage}
        />
      ) : (
        <ErrorComponent errorResult={statResult} />
      )}
    </div>
  );
}

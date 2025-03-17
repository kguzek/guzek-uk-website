import { getLocale, getTranslations } from "next-intl/server";

import { ErrorComponent } from "@/components/error/component";
import { TextWithUrl } from "@/components/text-with-url";
import { Link } from "@/i18n/navigation";
import { getFormatters } from "@/i18n/request";
import { fetchFromApi } from "@/lib/backend";
import { HttpError, NetworkError } from "@/lib/backend/error-handling";
import { ErrorCode } from "@/lib/enums";
import { getAuth } from "@/lib/providers/auth-provider";

import { Player } from "./player";

function isNumber(val: string | string[] | undefined): val is string {
  return !Array.isArray(val) && val != null && `${+val}` === val && +val > 0;
}

interface Props {
  params: Promise<{ showName: string; season: string; episode: string }>;
}

export default async function Watch({ params }: Props) {
  const t = await getTranslations();
  const locale = await getLocale();
  const formatters = getFormatters(locale);
  const { showName, season: seasonString, episode: episodeString } = await params;
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
  if (user.serverUrl == null || user.serverUrl === "") {
    // console.warn("User without server URL accessed /liveseries/watch");
    return (
      <ErrorComponent
        errorCode={ErrorCode.Forbidden}
        errorMessage={<TextWithUrl>{t("liveSeries.explanation")}</TextWithUrl>}
      />
    );
  }

  const season = +seasonString;
  const episode = +episodeString;

  let statError = null;
  try {
    await fetchFromApi(`liveseries/video/${showName}/${season}/${episode}`, {
      headers: { Range: "bytes=0-1" },
      urlBase: user.serverUrl,
      accessToken,
    });
  } catch (error) {
    statError = error;
  }

  const episodeObject = { number: episode, season };

  return (
    <div>
      <h2 className="my-6 text-3xl font-bold">
        {decodeURIComponent(showName)} {formatters.serialiseEpisode(episodeObject)}
      </h2>
      <div className="mb-2 flex flex-col items-center text-sm sm:text-xl md:flex-row md:items-start">
        <div className="flex gap-3">
          {season > 1 && (
            <>
              <Link href={`/liveseries/watch/${showName}/${season - 1}/1`}>
                {t("liveSeries.watch.previous")} {t("liveSeries.tvShow.season")}
              </Link>
              |
            </>
          )}
          <Link href={`/liveseries/watch/${showName}/${season + 1}/1`}>
            {t("liveSeries.watch.next")} {t("liveSeries.tvShow.season")}
          </Link>
        </div>
        <span className="mx-3 hidden md:block">|</span>
        <div className="flex gap-3">
          {episode > 1 && (
            <>
              <Link href={`/liveseries/watch/${showName}/${season}/${episode - 1}`}>
                {t("liveSeries.watch.previous")} {t("liveSeries.tvShow.episode")}
              </Link>
              |
            </>
          )}
          <Link href={`/liveseries/watch/${showName}/${season}/${episode + 1}`}>
            {t("liveSeries.watch.next")} {t("liveSeries.tvShow.episode")}
          </Link>
        </div>
      </div>
      {statError == null ? (
        <Player
          showName={showName}
          season={season}
          episode={episode}
          apiBase={user.serverUrl}
          accessToken={accessToken}
        />
      ) : (
        <ErrorComponent
          errorCode={
            statError instanceof NetworkError ? ErrorCode.ServerError : ErrorCode.NotFound
          }
          errorMessage={
            statError instanceof HttpError ? statError.message : t("networkError")
          }
        />
      )}
    </div>
  );
}

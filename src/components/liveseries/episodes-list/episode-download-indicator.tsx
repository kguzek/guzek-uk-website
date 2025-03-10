"use client";

import type { Episode as TvMazeEpisode, Show as TvMazeShow } from "tvmaze-wrapper-ts";
import { useEffect, useState } from "react";
import { DownloadIcon, TriangleIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { DownloadedEpisode } from "@/lib/types";
import type { User } from "@/payload-types";
import { showErrorToast } from "@/components/error/toast";
import { showInfoToast } from "@/components/ui/sonner";
import { Link } from "@/i18n/navigation";
import { getFormatters } from "@/i18n/request";
import { fetchFromApi } from "@/lib/backend";
import { useLiveSeriesContext } from "@/lib/context/liveseries-context";
import { DownloadStatus } from "@/lib/enums";
import { bytesToReadable, compareEpisodes } from "@/lib/util";
import { cn } from "@/lib/utils";

export function EpisodeDownloadIndicator({
  user,
  episode,
  tvShow,
  accessToken,
}: {
  episode: TvMazeEpisode;
  tvShow: TvMazeShow;
  user: User | null;
  accessToken: string | null;
}) {
  const { downloadedEpisodes } = useLiveSeriesContext();

  const episodeObject = {
    showName: tvShow.name.replace(/:/g, ""), // Torrent filenames omit colons
    season: episode.season,
    episode: episode.number,
  };

  const [metadata, setMetadata] = useState<undefined | DownloadedEpisode>(undefined);
  const t = useTranslations();
  const locale = useLocale();
  const formatters = getFormatters(locale);

  const episodeString = `${tvShow.name} ${formatters.serialiseEpisode(episode)}`;

  useEffect(() => {
    const meta = downloadedEpisodes.find((check) =>
      compareEpisodes(check, episodeObject),
    );
    if (meta) setMetadata(meta);
  }, [downloadedEpisodes]);

  async function startDownload() {
    if (user == null || accessToken == null) {
      showErrorToast(t("liveSeries.home.login"));
      return;
    }
    if (user.serverUrl == null || user.serverUrl === "") {
      showInfoToast(t("liveSeries.explanation"));
      return;
    }
    try {
      await fetchFromApi("liveseries/downloaded-episodes", {
        method: "POST",
        body: {
          showId: tvShow.id,
          showName: tvShow.name,
          episode: episode.number,
          season: episode.season,
        },
        urlBase: user.serverUrl,
      });
      setMetadata((old) => old && { ...old, status: DownloadStatus.PENDING });
    } catch (error) {
      console.error(error);
      showErrorToast(t("liveSeries.episodes.downloadError", { episodeString }));
      setMetadata((old) => old && { ...old, status: DownloadStatus.FAILED });
    }
  }

  const downloadStatus = metadata?.status ?? DownloadStatus.STOPPED;
  let downloadTooltip = t("liveSeries.episodes.downloadStatus")[downloadStatus];
  const showProgress =
    metadata != null &&
    [DownloadStatus.PENDING, DownloadStatus.VERIFYING].includes(downloadStatus);
  if (metadata?.progress != null) {
    downloadTooltip += ` (${(metadata.progress * 100).toFixed(1)}%${metadata.speed ? ` @ ${bytesToReadable(metadata.speed)}/s` : ""})`;
  }

  return (
    <>
      {downloadStatus !== DownloadStatus.COMPLETE && (
        <button
          className={cn("relative", {
            "clickable text-primary": downloadStatus === DownloadStatus.STOPPED,
            "text-primary cursor-wait": showProgress,
            "text-error cursor-not-allowed": downloadStatus === DownloadStatus.FAILED,
            "text-accent2 cursor-help": downloadStatus === DownloadStatus.UNKNOWN,
          })}
          title={downloadTooltip}
          style={{ minWidth: 20 }}
          onClick={downloadStatus === DownloadStatus.STOPPED ? startDownload : undefined}
        >
          {showProgress && (
            <div
              className="absolute overflow-hidden"
              style={{
                width: `${100 * (metadata?.progress ?? 0)}%`,
              }}
            >
              <DownloadIcon
                className={cn({
                  "text-success": downloadStatus === DownloadStatus.PENDING,
                  "text-accent2": downloadStatus === DownloadStatus.VERIFYING,
                })}
              ></DownloadIcon>
            </div>
          )}
          <DownloadIcon />
        </button>
      )}
      {!showProgress && user != null && (
        <Link
          href={`/liveseries/watch/${tvShow.name}/${episode.season}/${episode.number}`}
          title={t("liveSeries.episodes.downloadStatus")[DownloadStatus.COMPLETE]}
        >
          <TriangleIcon
            className={cn("clickable rotate-90", {
              "text-primary": downloadStatus !== DownloadStatus.COMPLETE,
            })}
            fill={downloadStatus === DownloadStatus.COMPLETE ? "currentColor" : "none"}
          />
        </Link>
      )}
    </>
  );
}

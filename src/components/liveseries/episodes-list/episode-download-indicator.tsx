"use client";

import type { Episode as TvMazeEpisode, Show as TvMazeShow } from "tvmaze-wrapper-ts";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DownloadIcon, TriangleIcon } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { DownloadedEpisode, User } from "@/lib/types";
import { fetchFromApi } from "@/lib/backend/v2";
import { useLiveSeriesContext } from "@/lib/context/liveseries-context";
import { useModals } from "@/lib/context/modal-context";
import { DownloadStatus } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { bytesToReadable, compareEpisodes } from "@/lib/util";
import { cn } from "@/lib/utils";

export function EpisodeDownloadIndicator({
  user,
  userLanguage,
  episode,
  tvShow,
  accessToken,
}: {
  userLanguage: Language;
  episode: TvMazeEpisode;
  tvShow: TvMazeShow;
  user: User | null;
  accessToken: string | null;
}) {
  const { setModalError, setModalInfo } = useModals();
  const { downloadedEpisodes } = useLiveSeriesContext();

  const episodeObject = {
    showName: tvShow.name.replace(/:/g, ""), // Torrent filenames omit colons
    season: episode.season,
    episode: episode.number,
  };

  const [metadata, setMetadata] = useState<undefined | DownloadedEpisode>(undefined);
  const data = TRANSLATIONS[userLanguage];

  const episodeString = `${tvShow.name} ${data.liveSeries.episodes.serialise(episode)}`;

  useEffect(() => {
    const meta = downloadedEpisodes.find((check) =>
      compareEpisodes(check, episodeObject),
    );
    if (meta) setMetadata(meta);
  }, [downloadedEpisodes]);

  async function startDownload() {
    if (user == null || accessToken == null) {
      setModalError(data.liveSeries.home.login);
      return;
    }
    if (!user.serverUrl) {
      setModalInfo(data.liveSeries.explanation);
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
      setModalError(data.liveSeries.episodes.downloadError(episodeString));
      setMetadata((old) => old && { ...old, status: DownloadStatus.FAILED });
    }
  }

  const downloadStatus = metadata?.status ?? DownloadStatus.STOPPED;
  let downloadTooltip = data.liveSeries.episodes.downloadStatus[downloadStatus];
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
          title={data.liveSeries.episodes.downloadStatus[DownloadStatus.COMPLETE]}
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

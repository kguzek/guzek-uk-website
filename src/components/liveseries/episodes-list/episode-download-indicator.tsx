"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DownloadIcon, TriangleIcon } from "lucide-react";

import type { Language } from "@/lib/enums";
import type {
  DownloadedEpisode,
  Episode,
  TvShowDetails,
  User,
} from "@/lib/types";
import { clientToApi } from "@/lib/backend/client";
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
  episode: Episode;
  tvShow: TvShowDetails;
  user: User | null;
  accessToken: string | null;
}) {
  const { setModalError, setModalInfo } = useModals();
  const { downloadedEpisodes } = useLiveSeriesContext();

  const episodeObject = {
    showName: tvShow.name.replace(/:/g, ""), // Torrent filenames omit colons
    season: episode.season,
    episode: episode.episode,
  };

  const [metadata, setMetadata] = useState<undefined | DownloadedEpisode>(
    undefined,
  );
  const data = TRANSLATIONS[userLanguage];

  const episodeString = `${tvShow.name} ${data.liveSeries.episodes.serialise(
    episode,
  )}`;

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
    const result = await clientToApi(
      "liveseries/downloaded-episodes",
      accessToken,
      {
        method: "POST",
        body: {
          showId: tvShow.id,
          showName: tvShow.name,
          episode: episode.episode,
          season: episode.season,
        },
        user,
        userLanguage,
        setModalError,
      },
    );
    if (result.ok) {
      setMetadata((old) => old && { ...old, status: DownloadStatus.PENDING });
    } else {
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
        <div
          className={cn("relative", {
            "clickable text-primary": downloadStatus === DownloadStatus.STOPPED,
            "cursor-wait text-primary": showProgress,
            "cursor-not-allowed text-error":
              downloadStatus === DownloadStatus.FAILED,
            "cursor-help text-accent2":
              downloadStatus === DownloadStatus.UNKNOWN,
          })}
          title={downloadTooltip}
          style={{ minWidth: 20 }}
          onClick={
            downloadStatus === DownloadStatus.STOPPED
              ? startDownload
              : undefined
          }
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
        </div>
      )}
      {!showProgress && user != null && (
        <Link
          href={`/liveseries/watch/${tvShow.name}/${episode.season}/${episode.episode}`}
          title={
            data.liveSeries.episodes.downloadStatus[DownloadStatus.COMPLETE]
          }
        >
          <TriangleIcon
            className={cn("clickable rotate-90", {
              "text-primary": downloadStatus !== DownloadStatus.COMPLETE,
            })}
            fill={
              downloadStatus === DownloadStatus.COMPLETE
                ? "currentColor"
                : "none"
            }
          />
        </Link>
      )}
    </>
  );
}

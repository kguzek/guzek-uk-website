"use client";

import { clientToApi } from "@/lib/backend/client";
import { DownloadStatus } from "@/lib/enums";
import type { Language } from "@/lib/enums";
import type {
  DownloadedEpisode,
  Episode,
  TvShowDetails,
  User,
} from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";
import { useModals } from "@/context/modal-context";
import { useState } from "react";
import { bytesToReadable } from "@/lib/util";
import Link from "next/link";

export function EpisodeDownloadIndicator({
  user,
  userLanguage,
  episode,
  tvShow,
  accessToken,
  metadata: initialMetadata,
}: {
  user: User;
  userLanguage: Language;
  episode: Episode;
  tvShow: TvShowDetails;
  accessToken: string;
  metadata: DownloadedEpisode | undefined;
}) {
  const { setModalError } = useModals();
  const [metadata, setMetadata] = useState(initialMetadata);
  const data = TRANSLATIONS[userLanguage];

  const episodeString = `${tvShow.name} ${data.liveSeries.episodes.serialise(
    episode,
  )}`;

  async function startDownload() {
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
    metadata &&
    [DownloadStatus.PENDING, DownloadStatus.VERIFYING].includes(downloadStatus);
  if (showProgress) {
    if (metadata.progress != null)
      downloadTooltip += ` (${(metadata.progress * 100).toFixed(1)}%)`;
    if (metadata.speed != null)
      downloadTooltip = downloadTooltip.replace(
        ")",
        ` @ ${bytesToReadable(metadata.speed)}/s)`,
      );
  }
  const downloadIcon = (
    <i className={`fas fa-download status-${downloadStatus}`}></i>
  );
  const playIcon = <i className={`fas fa-play status-${downloadStatus}`}></i>;

  return (
    <>
      <div
        className="flex flex-col"
        title={downloadTooltip}
        style={{ minWidth: 20 }}
        onClick={
          downloadStatus === DownloadStatus.STOPPED ? startDownload : undefined
        }
      >
        {showProgress && (
          <i
            className="fas fa-download status-progress-bar"
            style={{
              backgroundSize: `${100 * (metadata?.progress ?? 0)}%`,
            }}
          ></i>
        )}
        {downloadStatus !== DownloadStatus.COMPLETE && downloadIcon}
      </div>
      <Link
        href={`/liveseries/watch/${tvShow.name}/${episode.season}/${episode.episode}`}
        title={data.liveSeries.episodes.downloadStatus[DownloadStatus.COMPLETE]}
      >
        {playIcon}
      </Link>
    </>
  );
}

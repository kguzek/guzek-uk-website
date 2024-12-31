"use client";

import { ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import {
  Episode as EpisodeType,
  TvShowDetails,
  DownloadedEpisode,
  DownloadStatus,
} from "@/lib/types";
import {
  getEpisodeAirDate,
  hasEpisodeAired,
  bytesToReadable,
  compareEpisodes,
} from "@/lib/util";
import { useTranslations } from "@/context/translation-context";
import { useAuth } from "@/context/auth-context";
import { useModals } from "@/context/modal-context";
import { useFetch } from "@/context/fetch-context";
import { useLiveSeries } from "@/context/liveseries-context";

function Episode({
  episode,
  tvShow,
}: {
  episode: EpisodeType;
  tvShow: TvShowDetails;
}) {
  const [metadata, setMetadata] = useState<DownloadedEpisode | undefined>();
  const { data } = useTranslations();
  const { user } = useAuth();
  const { setModalError } = useModals();
  const { removeOldCaches } = useFetch();
  const {
    setWatchedEpisodes,
    watchedEpisodes,
    fetchResource,
    downloadedEpisodes,
    monitorEpisodeDownloads,
  } = useLiveSeries();

  const airDate = data.dateTimeFormat.format(getEpisodeAirDate(episode));
  const watchedInSeason = watchedEpisodes?.[tvShow.id]?.[+episode.season];
  const isWatched = watchedInSeason?.includes(episode.episode);
  const episodeString = `${tvShow.name} ${data.liveSeries.episodes.serialise(
    episode,
  )}`;

  const episodePredicate = (
    check: DownloadedEpisode, // Torrents filenames omit colons
  ) =>
    compareEpisodes(check, {
      ...episode,
      showName: tvShow.name.replace(/:/g, ""),
    });

  useEffect(() => {
    const downloadedEpisode = downloadedEpisodes.find(episodePredicate);
    setMetadata(downloadedEpisode);
  }, [downloadedEpisodes]);

  function updateWatchedEpisodes(episodes: number[]) {
    fetchResource(`watched-episodes/personal/${tvShow.id}/${episode.season}`, {
      method: "PUT",
      onSuccess: () => removeOldCaches(),
      onError: () => setWatchedEpisodes(watchedEpisodes),
      body: episodes,
      useEpisodate: false,
    });
    setWatchedEpisodes((old) => ({
      ...old,
      [tvShow.id]: { ...old?.[tvShow.id], [episode.season]: episodes },
    }));
  }

  function startDownload() {
    fetchResource("downloaded-episodes", {
      method: "POST",
      useEpisodate: false,
      body: {
        showId: tvShow.id,
        showName: tvShow.name,
        episode: episode.episode,
        season: episode.season,
      },
      onSuccess: (data) =>
        monitorEpisodeDownloads(data, episodePredicate, episodeString),
      onError: () => {
        setModalError(data.liveSeries.episodes.downloadError(episodeString));
        setMetadata((old) => old && { ...old, status: DownloadStatus.FAILED });
      },
    });
    setMetadata((old) => old && { ...old, status: DownloadStatus.PENDING });
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
    <div className="episode">
      <div className="episode-details no-overflow">
        <div className="flex" title={episode.name}>
          <span className="color-primary">
            {data.liveSeries.episodes.serialise(episode)}
          </span>{" "}
          <div className="cutoff">{episode.name}</div>
        </div>
        <small>{airDate}</small>
      </div>
      <div className="noshrink flex gap-10">
        {user?.serverUrl?.length && (
          <>
            <div
              className="flex-column flex"
              title={downloadTooltip}
              style={{ minWidth: 20 }}
              onClick={
                downloadStatus === DownloadStatus.STOPPED
                  ? startDownload
                  : undefined
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
              title={
                data.liveSeries.episodes.downloadStatus[DownloadStatus.COMPLETE]
              }
            >
              {playIcon}
            </Link>
          </>
        )}
        {hasEpisodeAired(episode) ? (
          <div
            className="watched centred"
            title={data.liveSeries.tvShow.markWatched(
              isWatched ? data.liveSeries.tvShow.un : "",
            )}
            onClick={() =>
              updateWatchedEpisodes(
                isWatched
                  ? (watchedInSeason?.filter(
                      (value) => value !== episode.episode,
                    ) ?? [])
                  : [...(watchedInSeason ?? []), episode.episode],
              )
            }
          >
            <i
              className={`clickable fas fa-eye${isWatched ? "" : "-slash"}`}
            ></i>
          </div>
        ) : (
          <i className="watched centred fa-regular fa-clock"></i>
        )}
      </div>
    </div>
  );
}

export function EpisodesList({
  tvShow,
  heading,
  episodes,
  children,
}: {
  tvShow: TvShowDetails;
  heading: string;
  episodes: EpisodeType[];
  children?: ReactElement<any, any>;
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      <div className="episodes-header gap-15">
        <div
          className="clickable gap-15 flex"
          onClick={() => setCollapsed((old) => !old)}
        >
          <i
            className={`fas fa-caret-right transition-transform ${
              collapsed ? "" : "rotate-90"
            }`}
          ></i>
          <h4>{heading}</h4>
        </div>
        {children}
      </div>
      <div
        className={`episodes-container collapsible ${
          collapsed ? "hidden" : ""
        }`}
      >
        <div className="episodes no-overflow flex-wrap gap-10">
          {episodes.map((episode, idx) => (
            <Episode
              key={`episode-unwatched-${idx}`}
              episode={episode}
              tvShow={tvShow}
            />
          ))}
        </div>
      </div>
    </>
  );
}

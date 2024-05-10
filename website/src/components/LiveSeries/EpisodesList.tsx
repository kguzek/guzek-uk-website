import React, { ReactElement, useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { TranslationContext } from "../../misc/context";
import {
  Episode as EpisodeType,
  EpisodeStatuses,
  ShowData,
} from "../../misc/models";
import { getEpisodeAirDate, hasEpisodeAired } from "../../misc/util";
import { LiveSeriesOutletContext } from "../../pages/LiveSeries/Base";

const DOWNLOAD_STATES = ["pending", "failed", "downloaded", undefined] as const;

function Episode({
  episode,
  showId,
  downloadStatus,
}: {
  episode: EpisodeType;
  showId: number;
  downloadStatus?: "pending" | "failed" | "downloaded";
}) {
  const data = useContext(TranslationContext);
  const { setWatchedEpisodes, watchedEpisodes, fetchResource, reloadSite } =
    useOutletContext<LiveSeriesOutletContext>();
  const airDate = data.dateTimeFormat.format(getEpisodeAirDate(episode));

  const watchedInSeason = watchedEpisodes?.[showId]?.[+episode.season];
  const isWatched = watchedInSeason?.includes(episode.episode);

  function updateWatchedEpisodes(episodes: number[]) {
    fetchResource(`watched-episodes/personal/${showId}/${episode.season}`, {
      method: "PUT",
      onSuccess: () => reloadSite(),
      onError: () => setWatchedEpisodes(watchedEpisodes),
      body: episodes,
      useEpisodate: false,
    });
    setWatchedEpisodes((old) => ({
      ...old,
      [showId]: { ...old?.[showId], [episode.season]: episodes },
    }));
  }

  return (
    <div className="episode">
      <div className="episode-details no-overflow">
        <div className="flex" title={episode.name}>
          <span className="color-primary">
            {data.liveSeries.tvShow.serialiseEpisode(episode)}
          </span>{" "}
          <div className="cutoff">{episode.name}</div>
        </div>
        <small>{airDate}</small>
      </div>
      <div className="flex gap-10 noshrink">
        {downloadStatus && (
          <div
            className="centred"
            title={data.liveSeries.download[downloadStatus]}
          >
            <i className={`fas fa-download ${downloadStatus}`}></i>
          </div>
        )}
        {hasEpisodeAired(episode) ? (
          <div
            className="watched centred"
            title={data.liveSeries.tvShow.markWatched.replace(
              "{UN}",
              isWatched ? data.liveSeries.tvShow.un : ""
            )}
            onClick={() =>
              updateWatchedEpisodes(
                isWatched
                  ? watchedInSeason?.filter(
                      (value) => value !== episode.episode
                    ) ?? []
                  : [...(watchedInSeason ?? []), episode.episode]
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

export default function EpisodesList({
  showId,
  heading,
  episodes,
  episodeStatuses,
  children,
}: {
  showId: number;
  heading: string;
  episodes: EpisodeType[];
  episodeStatuses?: ShowData<EpisodeStatuses>;
  children?: ReactElement<any, any>;
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      <div className="episodes-header gap-15">
        <div
          className="clickable flex gap-15"
          onClick={() => setCollapsed((old) => !old)}
        >
          <i className={`fas fa-caret-${collapsed ? "down" : "up"}`}></i>
          <h4>{heading}</h4>
        </div>
        {children}
      </div>
      <div className={`episodes-container ${collapsed ? "hidden" : ""}`}>
        <div className="episodes flex-wrap">
          {episodes.map((episode, idx) => (
            <Episode
              key={`episode-unwatched-${idx}`}
              episode={episode}
              showId={showId}
              downloadStatus={
                episodeStatuses &&
                DOWNLOAD_STATES[Math.round(Math.random() * 10) % 4]
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}


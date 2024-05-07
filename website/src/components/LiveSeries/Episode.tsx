import React from "react";
import { useOutletContext } from "react-router-dom";
import { Episode as EpisodeData, WatchedEpisodes } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { OutletContext } from "../../pages/LiveSeries/Base";

export default function Episode({
  data,
  episode,
  showId,
  downloadStatus,
}: {
  data: Translation;
  episode: EpisodeData;
  showId: number;
  downloadStatus?: "pending" | "failed" | "downloaded";
}) {
  const { setWatchedEpisodes, watchedEpisodes, fetchResource, reloadSite } =
    useOutletContext<OutletContext>();
  const airDate = data.dateTimeFormat.format(new Date(episode.air_date));

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
      <div className="episode-details">
        <div className="cutoff">
          <span className="color-primary">
            {data.liveSeries.tvShow.serialiseEpisode(episode)}
          </span>{" "}
          {episode.name}
        </div>
        <small>{airDate}</small>
      </div>
      <div className="season">
        {downloadStatus && (
          <div
            className="centred"
            title={data.liveSeries.download[downloadStatus]}
          >
            <i className={`fas fa-download ${downloadStatus}`}></i>
          </div>
        )}
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
          <i className={`fas fa-eye${isWatched ? "" : "-slash"}`}></i>
        </div>
      </div>
    </div>
  );
}


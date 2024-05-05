import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Episode as EpisodeData } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { WatchedEpisodes } from "./TvShow";

export default function Episode({
  data,
  episode,
  watchedEpisodes,
  setWatchedEpisodes,
}: {
  data: Translation;
  episode: EpisodeData;
  watchedEpisodes: WatchedEpisodes;
  setWatchedEpisodes: Dispatch<SetStateAction<WatchedEpisodes>>;
}) {
  const airDate = data.dateFormat.format(new Date(episode.air_date));

  const watched = watchedEpisodes[+episode.season]?.includes(episode.episode);

  return (
    <div className="episode">
      <div className="episode-details">
        <div className="cutoff">
          {episode.episode}. {episode.name}
        </div>
        <small>{airDate}</small>
      </div>
      <div
        className="watched"
        onClick={() => {
          setWatchedEpisodes((old) => ({
            ...old,
            [+episode.season]: watched
              ? old[+episode.season].filter(
                  (watchedEpisode) => watchedEpisode !== episode.episode
                )
              : [...(old[+episode.season] || []), episode.episode],
          }));
        }}
      >
        <i className={`fas fa-eye${watched ? "" : "-slash"}`}></i>
      </div>
    </div>
  );
}


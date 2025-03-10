"use client";

import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import { ClockIcon, EyeIcon, EyeOffIcon } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { Numeric } from "@/lib/types";
import { useTvShowContext } from "@/lib/context/tv-show-context";
import { TRANSLATIONS } from "@/lib/translations";
import { hasEpisodeAired } from "@/lib/util";

export function WatchedIndicator({
  season,
  episodes,
  userLanguage,
}: {
  season: Numeric;
  episodes: TvMazeEpisode[];
  userLanguage: Language;
}) {
  const data = TRANSLATIONS[userLanguage];
  const { updateWatchedEpisodes, isSeasonWatched, isUpdating } = useTvShowContext();

  const allEpisodesAired = episodes.every(hasEpisodeAired);
  const seasonWatched = isSeasonWatched(season, episodes);

  return allEpisodesAired ? (
    <button
      title={data.liveSeries.tvShow.markAllWatched(
        seasonWatched ? data.liveSeries.tvShow.un : "",
      )}
      onClick={() => updateWatchedEpisodes(season, seasonWatched ? [] : episodes)}
      disabled={isUpdating}
      className="clickable"
    >
      {isSeasonWatched(season, episodes) ? (
        <EyeIcon className="text-primary-strong" />
      ) : (
        <EyeOffIcon />
      )}
    </button>
  ) : (
    <ClockIcon />
  );
}

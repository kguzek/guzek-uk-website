"use client";

import { ClockIcon, EyeIcon, EyeOffIcon } from "lucide-react";

import { useTvShowContext } from "@/context/tv-show-context";
import { TRANSLATIONS } from "@/lib/translations";
import { hasEpisodeAired } from "@/lib/util";
import type { Language } from "@/lib/enums";
import type { Episode } from "@/lib/types";

export function WatchedIndicator({
  season,
  episodes,
  userLanguage,
}: {
  season: string;
  episodes: Episode[];
  userLanguage: Language;
}) {
  const data = TRANSLATIONS[userLanguage];
  const { updateWatchedEpisodes, isSeasonWatched } = useTvShowContext();

  const allEpisodesAired = episodes.every(hasEpisodeAired);
  const seasonWatched = isSeasonWatched(season, episodes);

  return (
    <div className="centred">
      {allEpisodesAired ? (
        <div
          title={data.liveSeries.tvShow.markAllWatched(
            seasonWatched ? data.liveSeries.tvShow.un : "",
          )}
          onClick={() =>
            updateWatchedEpisodes(season, seasonWatched ? [] : episodes)
          }
          className="clickable"
        >
          {isSeasonWatched(season, episodes) ? (
            <EyeIcon className="text-primary-strong" />
          ) : (
            <EyeOffIcon />
          )}
        </div>
      ) : (
        <ClockIcon />
      )}
    </div>
  );
}

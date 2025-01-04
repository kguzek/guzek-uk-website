"use client";

import type { Language } from "@/lib/enums";
import type { Episode } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";
import { hasEpisodeAired } from "@/lib/util";
import { useTvShowContext } from "./context";

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
        >
          <i
            className={`clickable fas text-center fa-eye${seasonWatched ? "" : "-slash"}`}
          ></i>
        </div>
      ) : (
        <i className="fa-regular fa-clock"></i>
      )}
    </div>
  );
}

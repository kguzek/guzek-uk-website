"use client";

import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import { ClockIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Numeric } from "@/lib/types";
import { useTvShowContext } from "@/lib/context/tv-show-context";
import { hasEpisodeAired } from "@/lib/util";

export function WatchedIndicator({
  season,
  episodes,
}: {
  season: Numeric;
  episodes: TvMazeEpisode[];
}) {
  const t = useTranslations();
  const { updateWatchedEpisodes, isSeasonWatched, isUpdating } = useTvShowContext();

  const allEpisodesAired = episodes.every(hasEpisodeAired);
  const seasonWatched = isSeasonWatched(season, episodes);

  return allEpisodesAired ? (
    <button
      title={t("liveSeries.tvShow.markAllWatched", {
        un: seasonWatched ? t("liveSeries.tvShow.un") : "",
      })}
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

"use client";

import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { User } from "@/payload-types";
import { showErrorToast } from "@/components/error/toast";
import { useLiveSeriesContext } from "@/lib/context/liveseries-context";
import { addOrRemove } from "@/lib/util";

export function EpisodeWatchedIndicator({
  showId,
  episode,
  user,
}: {
  showId: number;
  episode: TvMazeEpisode;
  user: User | null;
}) {
  const t = useTranslations();
  const { watchedEpisodes, updateUserWatchedEpisodes } = useLiveSeriesContext();
  const watchedInSeason = watchedEpisodes?.[showId]?.[+episode.season] ?? [];
  const isWatched = watchedInSeason.includes(episode.number);

  function toggleWatched() {
    if (user == null) {
      showErrorToast(t("liveSeries.home.login"));
      return;
    }
    const newWatchedEpisodes = addOrRemove(watchedInSeason, episode.number, !isWatched);
    updateUserWatchedEpisodes(showId, episode.season, newWatchedEpisodes);
  }

  return (
    <button
      className="watched clickable"
      title={t("liveSeries.tvShow.markWatched", {
        un: isWatched ? t("liveSeries.tvShow.un") : "",
      })}
      onClick={toggleWatched}
    >
      {isWatched ? <EyeIcon className="text-primary-strong" /> : <EyeOffIcon />}
    </button>
  );
}

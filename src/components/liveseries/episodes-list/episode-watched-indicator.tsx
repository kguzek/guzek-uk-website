"use client";

import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { User } from "@/payload-types";
import { showErrorToast } from "@/components/error/toast";
import { useLiveSeriesContext } from "@/lib/context/liveseries-context";
import { TRANSLATIONS } from "@/lib/translations";
import { addOrRemove } from "@/lib/util";

export function EpisodeWatchedIndicator({
  userLanguage,
  showId,
  episode,
  user,
}: {
  userLanguage: Language;
  showId: number;
  episode: TvMazeEpisode;
  user: User | null;
}) {
  // TODO: make watched episodes a global context state
  const data = TRANSLATIONS[userLanguage];
  const { watchedEpisodes, updateUserWatchedEpisodes } = useLiveSeriesContext();
  const watchedInSeason = watchedEpisodes?.[showId]?.[+episode.season] ?? [];
  const isWatched = watchedInSeason.includes(episode.number);

  function toggleWatched() {
    if (user == null) {
      showErrorToast(data.liveSeries.home.login);
      return;
    }
    const newWatchedEpisodes = addOrRemove(watchedInSeason, episode.number, !isWatched);
    updateUserWatchedEpisodes(showId, episode.season, newWatchedEpisodes);
  }

  return (
    <button
      className="watched clickable"
      title={data.liveSeries.tvShow.markWatched(
        isWatched ? data.liveSeries.tvShow.un : "",
      )}
      onClick={toggleWatched}
    >
      {isWatched ? <EyeIcon className="text-primary-strong" /> : <EyeOffIcon />}
    </button>
  );
}

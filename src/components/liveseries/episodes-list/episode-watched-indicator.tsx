"use client";

import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import { useOptimistic, useState, useTransition } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { User } from "@/payload-types";
import { showErrorToast } from "@/components/error/toast";
import { updateUserWatchedEpisodes } from "@/lib/backend/liveseries";
import { TRANSLATIONS } from "@/lib/translations";
import { addOrRemove } from "@/lib/util";

export function EpisodeWatchedIndicator({
  userLanguage,
  showId,
  episode,
  watchedInSeason: initialWatchedInSeason,
  user,
}: {
  userLanguage: Language;
  showId: number;
  episode: TvMazeEpisode;
  watchedInSeason: number[];
  user: User | null;
}) {
  const [isPending, startTransition] = useTransition();
  // TODO: make watched episodes a global context state
  const [watchedInSeason, setWatchedInSeason] = useState(initialWatchedInSeason);
  const [watchedInSeasonOptimistic, setWatchedInSeasonOptimistic] =
    useOptimistic(watchedInSeason);
  const data = TRANSLATIONS[userLanguage];
  const isWatched = watchedInSeasonOptimistic.includes(episode.number);

  function toggleWatched() {
    if (user == null) {
      showErrorToast(data.liveSeries.home.login);
      return;
    }
    const newWatchedEpisodes = addOrRemove(watchedInSeason, episode.number, !isWatched);

    startTransition(async () => {
      setWatchedInSeasonOptimistic(newWatchedEpisodes);
      if (
        await updateUserWatchedEpisodes(user, userLanguage, showId, episode.season, {
          watchedInSeason: newWatchedEpisodes,
        })
      ) {
        setWatchedInSeason(newWatchedEpisodes);
      }
    });
  }

  return (
    <button
      className="watched clickable"
      disabled={isPending}
      title={data.liveSeries.tvShow.markWatched(
        isWatched ? data.liveSeries.tvShow.un : "",
      )}
      onClick={toggleWatched}
    >
      {isWatched ? <EyeIcon className="text-primary-strong" /> : <EyeOffIcon />}
    </button>
  );
}

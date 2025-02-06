"use client";

import { useState } from "react";

import { EyeIcon, EyeOffIcon } from "lucide-react";

import { useModals } from "@/context/modal-context";
import { clientToApi } from "@/lib/backend/client";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { Episode } from "@/lib/types";

export function EpisodeWatchedIndicator({
  userLanguage,
  showId,
  episode,
  watchedInSeason,
  accessToken,
}: {
  userLanguage: Language;
  showId: number;
  episode: Episode;
  watchedInSeason: number[];
  accessToken: string | null;
}) {
  const [isWatched, setIsWatched] = useState(
    watchedInSeason.includes(episode.episode),
  );
  const { setModalError } = useModals();
  const data = TRANSLATIONS[userLanguage];

  async function updateWatchedEpisodes(episodes: number[]) {
    if (accessToken == null) {
      setModalError(data.liveSeries.home.login);
      return;
    }
    const result = await clientToApi(
      `liveseries/watched-episodes/personal/${showId}/${episode.season}`,
      accessToken,
      {
        method: "PUT",
        body: episodes,
        userLanguage,
        setModalError,
      },
    );
    if (result.ok) {
      setIsWatched((old) => !old);
    } else {
      setModalError(data.networkError);
    }
  }

  return (
    <button
      className="watched centred clickable"
      title={data.liveSeries.tvShow.markWatched(
        isWatched ? data.liveSeries.tvShow.un : "",
      )}
      onClick={() =>
        updateWatchedEpisodes(
          isWatched
            ? (watchedInSeason?.filter((value) => value !== episode.episode) ??
                [])
            : [...(watchedInSeason ?? []), episode.episode],
        )
      }
    >
      {isWatched ? <EyeIcon className="text-primary-strong" /> : <EyeOffIcon />}
    </button>
  );
}

"use client";

import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import { createContext, useContext } from "react";

interface TvShowContextType {
  isSeasonWatched: (season: number | `${number}`, episodes: TvMazeEpisode[]) => boolean;
  updateWatchedEpisodes: (
    season: number | `${number}`,
    episodes: TvMazeEpisode[],
  ) => void;
}

export const TvShowContext = createContext<TvShowContextType>({
  isSeasonWatched: () => false,
  updateWatchedEpisodes: () => {},
});

export function useTvShowContext() {
  const context = useContext(TvShowContext);
  if (!context) {
    throw new Error("useTvShowContext must be used within a TvShowContext");
  }
  return context;
}

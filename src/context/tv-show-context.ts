"use client";

import { createContext, useContext } from "react";

import type { Episode } from "@/lib/types";

interface TvShowContextType {
  isSeasonWatched: (season: string, episodes: Episode[]) => boolean;
  updateWatchedEpisodes: (season: string, episodes: Episode[]) => void;
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

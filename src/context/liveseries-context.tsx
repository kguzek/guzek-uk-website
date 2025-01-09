"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import type { Language } from "@/lib/enums";
import type { DownloadedEpisode } from "@/lib/types";
// import { TRANSLATIONS } from "@/lib/translations";

export const LiveSeriesContext = createContext<{
  downloadedEpisodes: DownloadedEpisode[];
}>({
  downloadedEpisodes: [],
});

export function useLiveSeriesContext() {
  const context = useContext(LiveSeriesContext);
  if (!context) {
    throw new Error("useLiveSeries must be used within /liveseries.");
  }
  return context;
}

export function LiveSeriesProvider({
  children,
  // userLanguage,
}: {
  children: ReactNode;
  userLanguage: Language;
}) {
  const [downloadedEpisodes /*setDownloadedEpisodes*/] = useState<
    DownloadedEpisode[]
  >([]);
  // const data = TRANSLATIONS[userLanguage];

  // TODO: Implement the liveseries context

  return (
    <LiveSeriesContext.Provider
      value={{
        downloadedEpisodes,
      }}
    >
      {children}
    </LiveSeriesContext.Provider>
  );
}

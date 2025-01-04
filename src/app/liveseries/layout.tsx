import DownloadsWidget from "@/components/liveseries/downloads-widget";
import { MiniNavBar } from "@/components/navigation/navigation-bar-client";
import { getAccessToken, serverToApi } from "@/lib/backend/server";
import { DownloadedEpisode } from "@/lib/types";
import { getCurrentUser } from "@/lib/backend/user";
import { useTranslations } from "@/providers/translation-provider";
import { ReactNode } from "react";

export default async function LiveSeriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data, userLanguage } = await useTranslations();
  const accessToken = await getAccessToken();
  const user = await getCurrentUser();
  let downloadedEpisodes: DownloadedEpisode[] = [];
  if (user) {
    const downloadedEpisodesResult = await serverToApi<DownloadedEpisode[]>(
      "liveseries/downloaded-episodes",
    );
    if (downloadedEpisodesResult.ok) {
      downloadedEpisodes = downloadedEpisodesResult.data;
    }
  }
  return (
    <div className="text liveseries">
      {accessToken && user && (
        <DownloadsWidget
          user={user}
          userLanguage={userLanguage}
          accessToken={accessToken}
          downloadedEpisodes={downloadedEpisodes}
        />
      )}
      <MiniNavBar
        pathBase="liveseries"
        pages={[
          { link: "", label: data.liveSeries.home.title },
          { link: "search", label: data.liveSeries.search.title },
          {
            link: "most-popular",
            label: data.liveSeries.mostPopular.title,
          },
        ]}
      />
      {children}
    </div>
  );
}

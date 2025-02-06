import type { ReactNode } from "react";

import { DownloadsWidget } from "@/components/liveseries/downloads-widget";
import { MiniNavBar } from "@/components/navigation/navigation-bar-client";
import { LiveSeriesProvider } from "@/context/liveseries-context";
import { getAuth } from "@/providers/auth-provider";
import { getTranslations } from "@/providers/translation-provider";

export default async function LiveSeriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data, userLanguage } = await getTranslations();
  const { user, accessToken } = await getAuth();
  return (
    <div className="text liveseries">
      <LiveSeriesProvider
        userLanguage={userLanguage}
        user={user}
        accessToken={accessToken}
      >
        {accessToken && user && (
          <DownloadsWidget
            user={user}
            userLanguage={userLanguage}
            accessToken={accessToken}
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
      </LiveSeriesProvider>
    </div>
  );
}

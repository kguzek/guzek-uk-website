import { DownloadsWidget } from "@/components/liveseries/downloads-widget";
import { MiniNavBar } from "@/components/navigation/navigation-bar-client";
import { LiveSeriesProvider } from "@/context/liveseries-context";
import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "@/providers/translation-provider";
import { ReactNode } from "react";

export default async function LiveSeriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data, userLanguage } = await useTranslations();
  const { user, accessToken } = await useAuth();
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

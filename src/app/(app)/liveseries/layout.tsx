import type { ReactNode } from "react";

import { DownloadsWidget } from "@/components/liveseries/downloads-widget";
import { LiveSeriesProvider } from "@/lib/context/liveseries-context";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";

export default async function LiveSeriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userLanguage } = await getTranslations();
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
        {children}
      </LiveSeriesProvider>
    </div>
  );
}

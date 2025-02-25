import type { ReactNode } from "react";
import Link from "next/link";
import { Search, TrendingUp } from "lucide-react";

import { DownloadsWidget } from "@/components/liveseries/downloads-widget";
import { Button } from "@/components/ui/button";
import { LiveSeriesProvider } from "@/lib/context/liveseries-context";
import { getAuth } from "@/lib/providers/auth-provider/rsc";
import { getTranslations } from "@/lib/providers/translation-provider";

export default async function LiveSeriesLayout({ children }: { children: ReactNode }) {
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
        <div className="flex items-center gap-4">
          <Button variant="link" className="px-0">
            <Link href="/liveseries/most-popular" className="group flex gap-2">
              <TrendingUp />{" "}
              <span className="group-hover:underlined hover-underline">
                {data.liveSeries.mostPopular.title}
              </span>
            </Link>
          </Button>
          <small className="text-xs">{data.profile.formDetails.or}</small>
          <Button asChild>
            <Link href="/liveseries/search">
              <Search /> {data.liveSeries.search.label}
            </Link>
          </Button>
        </div>
        {children}
      </LiveSeriesProvider>
    </div>
  );
}

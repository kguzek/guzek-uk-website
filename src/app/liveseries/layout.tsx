"use client";

import { ReactNode, Suspense } from "react";
import { MiniNavBar } from "@/components/navigation/navigation-bar-client";
import DownloadsWidget from "@/components/liveseries/downloads-widget";
import { PageSkeleton } from "@/components/pages/skeleton";
import { useTranslations } from "@/context/translation-context";
import "./liveseries.css";
import { LiveSeriesProvider } from "@/context/liveseries-context";

export function getLiveSeriesTitle(
  page: "home" | "mostPopular" | "search" | "tvShow"
) {
  const { data } = useTranslations();
  return `${data.liveSeries[page].title} – ${data.liveSeries.title}`;
}

export default function LiveSeriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data } = useTranslations();

  return (
    <div className="text liveseries">
      <Suspense fallback={<PageSkeleton />}>
        <LiveSeriesProvider>
          <DownloadsWidget />
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
      </Suspense>
    </div>
  );
}
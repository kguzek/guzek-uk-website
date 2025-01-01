import DownloadsWidget from "@/components/liveseries/downloads-widget";
import { MiniNavBar } from "@/components/navigation/navigation-bar-client";
import { useTranslations } from "@/providers/translation-provider";
import { ReactNode } from "react";

export default async function LiveSeriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data } = await useTranslations();
  return (
    <div className="text liveseries">
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
    </div>
  );
}

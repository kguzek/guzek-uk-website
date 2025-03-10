import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Dot, LayoutDashboard, Search, TrendingUp } from "lucide-react";

import { DownloadsWidget } from "@/components/liveseries/downloads-widget";
import { Button } from "@/components/ui/button";
import { OG_IMAGE_METADATA } from "@/lib/constants";
import { LiveSeriesProvider } from "@/lib/context/liveseries-context";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle, PAGE_NAME } from "@/lib/util";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: {
      template: `${getTitle("%s", data.liveSeries.title)} | ${PAGE_NAME}`,
      default: "LiveSeries",
    },
    description: data.liveSeries.description,
    openGraph: {
      images: {
        url: "/api/og-image/liveseries/most-popular/1",
        ...OG_IMAGE_METADATA,
      },
    },
  };
}

export default async function LiveSeriesLayout({ children }: { children: ReactNode }) {
  const { data, userLanguage } = await getTranslations();
  const { user, accessToken } = await getAuth();
  return (
    <div className="text">
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
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:flex-nowrap sm:justify-start">
          <Button variant="link" className="px-0" asChild>
            <Link href="/liveseries" className="group flex items-center gap-2">
              <LayoutDashboard />{" "}
              <span className="group-hover:underlined hover-underline text-xs sm:text-sm md:text-base">
                {data.liveSeries.home.title}
              </span>
            </Link>
          </Button>
          <Dot className="hidden sm:block" />
          <Button variant="link" className="px-0" asChild>
            <Link
              href="/liveseries/most-popular"
              className="group flex items-center gap-2"
            >
              <TrendingUp />{" "}
              <span className="group-hover:underlined hover-underline text-xs sm:text-sm md:text-base">
                {data.liveSeries.mostPopular.title}
              </span>
            </Link>
          </Button>
          <Dot className="hidden sm:block" />
          <Button asChild className="text-xs sm:text-sm md:text-base">
            <Link href="/liveseries/search">
              <Search /> {data.liveSeries.search.labelShort}
            </Link>
          </Button>
        </div>
        {children}
      </LiveSeriesProvider>
    </div>
  );
}

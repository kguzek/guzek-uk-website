import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Dot, LayoutDashboard, Search, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ClientLink } from "@/components/link/client";
import { DownloadsWidget } from "@/components/liveseries/downloads-widget";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { OG_IMAGE_METADATA } from "@/lib/constants";
import { LiveSeriesProvider } from "@/lib/context/liveseries-context";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTitle, PAGE_NAME } from "@/lib/util";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: {
      template: `${getTitle("%s", t("liveSeries.title"))} | ${PAGE_NAME}`,
      default: "LiveSeries",
    },
    description: t("liveSeries.description"),
    openGraph: {
      images: {
        url: "/api/og-image/liveseries/most-popular/1",
        ...OG_IMAGE_METADATA,
      },
    },
  };
}

export default async function LiveSeriesLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();
  const { user, accessToken } = await getAuth();
  return (
    <div className="text">
      <LiveSeriesProvider user={user} accessToken={accessToken}>
        {accessToken && user && <DownloadsWidget user={user} accessToken={accessToken} />}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:flex-nowrap sm:justify-start">
          <Link href="/liveseries" className="group flex items-center gap-2">
            <LayoutDashboard />{" "}
            <span className="group-hover:underlined hover-underline text-xs sm:text-sm md:text-base">
              {t("liveSeries.home.title")}
            </span>
          </Link>
          <Dot className="hidden sm:block" />
          <Link href="/liveseries/most-popular" className="group flex items-center gap-2">
            <TrendingUp />{" "}
            <span className="group-hover:underlined hover-underline text-xs sm:text-sm md:text-base">
              {t("liveSeries.mostPopular.title")}
            </span>
          </Link>
          <Dot className="hidden sm:block" />
          <Button asChild className="text-xs sm:text-sm md:text-base">
            <ClientLink href="/liveseries/search">
              <Search /> {t("liveSeries.search.labelShort")}
            </ClientLink>
          </Button>
        </div>
        {children}
      </LiveSeriesProvider>
    </div>
  );
}

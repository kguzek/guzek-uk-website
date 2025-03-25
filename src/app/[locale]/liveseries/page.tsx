import type { Metadata } from "next";
import type { Episode as TvMazeEpisode, Show as TvMazeShow } from "tvmaze-wrapper-ts";
import { Search, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { findShowById, getShowEpisodes } from "tvmaze-wrapper-ts";

import type { EpisodeArray } from "@/payload-types";
import { ErrorComponent } from "@/components/error/component";
import { ClientLink } from "@/components/link/client";
import { EpisodesList } from "@/components/liveseries/episodes-list";
import { LikedShowsCarousel } from "@/components/liveseries/liked-shows-carousel";
import { TextWrapper } from "@/components/text-wrapper";
import { Tile } from "@/components/tile";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getUserShows } from "@/lib/backend/liveseries";
import { OG_IMAGE_METADATA } from "@/lib/constants";
import { ErrorCode } from "@/lib/enums";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTitle, hasEpisodeAired } from "@/lib/util";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: {
      absolute: `${t("liveSeries.seoTitle")} | Konrad Guzek`,
    },
    openGraph: {
      images: {
        url: "/api/og-image/liveseries/most-popular/1",
        ...OG_IMAGE_METADATA,
      },
    },
  };
}

type ShowWithEpisodes = TvMazeShow & { episodes: TvMazeEpisode[] };

export default async function Home() {
  const t = await getTranslations();
  const { user } = await getAuth();

  const watchedEpisodes = user?.watchedEpisodes ?? {};
  const likedShowIds: EpisodeArray = getUserShows(user);
  const likedShows: { [showId: number]: ShowWithEpisodes } = {};

  const unwatchedEpisodes: Record<number, TvMazeEpisode[]> = {};
  let totalUnwatchedEpisodes = 0;

  if (user != null) {
    let likedShowResponses: ShowWithEpisodes[] = [];
    try {
      likedShowResponses = await Promise.all(
        likedShowIds.map(async (id) => {
          const show = await findShowById(id);
          const episodes = await getShowEpisodes(id);
          return { ...show, episodes };
        }),
      );
    } catch (error) {
      console.error("LiveSeries fetch failed:", error);
      return <ErrorComponent errorCode={ErrorCode.ServerError} />;
    }

    for (const tvShow of likedShowResponses) {
      likedShows[tvShow.id] = tvShow;
      const unwatched = tvShow.episodes.filter(
        (episode) =>
          hasEpisodeAired(episode) &&
          !watchedEpisodes[tvShow.id]?.[episode.season]?.includes(episode.number),
      );
      unwatchedEpisodes[tvShow.id] = unwatched;
      totalUnwatchedEpisodes += unwatched.length;
    }
  }

  const header = (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(t("liveSeries.home.title"), t("liveSeries.title"))}
      </h2>
      <h3 className="mb-5 text-2xl font-bold">
        {t("liveSeries.home.likedShows")}
        {likedShowIds.length > 0 ? ` (${likedShowIds.length})` : ""}
      </h3>
    </>
  );

  return (
    <TextWrapper
      before={
        likedShowIds.length > 0 ? <div className="place-self-start">{header}</div> : null
      }
      after={
        user == null ? null : (
          <>
            <h3
              className={cn("mt-4 text-2xl font-bold", {
                "place-self-start": likedShowIds.length > 0,
              })}
            >
              {t("liveSeries.tvShow.unwatched")} {t("liveSeries.tvShow.episodes")}
            </h3>
            {totalUnwatchedEpisodes > 0 ? (
              <div className="w-full">
                {Object.entries(unwatchedEpisodes).map(
                  ([showId, unwatchedInShow], idx) =>
                    unwatchedInShow.length === 0 ? null : (
                      <EpisodesList
                        key={`liked-show-${showId}-${idx}`}
                        tvShow={likedShows[+showId]}
                        heading={`${likedShows[+showId].name} (${unwatchedInShow.length})`}
                        episodes={unwatchedInShow}
                      />
                    ),
                )}
              </div>
            ) : (
              <p
                className={cn("mt-5", {
                  "place-self-start": likedShowIds.length > 0,
                })}
              >
                {t("liveSeries.home.noUnwatched")}
              </p>
            )}
          </>
        )
      }
    >
      {likedShowIds.length > 0 ? null : header}
      {likedShowIds.length === 0 ? (
        <Tile glow containerClassName="w-full">
          <p className="mb-3 whitespace-pre-wrap">{t("liveSeries.home.noLikes")}</p>
          <Link
            href="/liveseries/most-popular/1"
            className="group flex items-center gap-2 px-0"
          >
            <TrendingUp />{" "}
            <span className="glow:underlined text-xs sm:text-sm md:text-base">
              {t("liveSeries.home.explore")} {t("liveSeries.mostPopular.title")}{" "}
              {t("liveSeries.home.shows")}
            </span>
          </Link>
          <Button asChild className="text-xs sm:text-sm md:text-base">
            <ClientLink href="/liveseries/search">
              <Search /> {t("liveSeries.search.label")}
            </ClientLink>
          </Button>
        </Tile>
      ) : (
        <LikedShowsCarousel likedShows={likedShows} user={user} />
      )}
    </TextWrapper>
  );
}

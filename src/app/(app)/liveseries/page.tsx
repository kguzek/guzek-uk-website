import type { Metadata } from "next";
import type { Episode as TvMazeEpisode, Show as TvMazeShow } from "tvmaze-wrapper-ts";
import Link from "next/link";
import { findShowById, getShowEpisodes } from "tvmaze-wrapper-ts";

import type { EpisodeArray } from "@/payload-types";
import { ErrorComponent } from "@/components/error/component";
import { EpisodesList } from "@/components/liveseries/episodes-list";
import { Tile } from "@/components/tile";
import { ErrorCode } from "@/lib/enums";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle, hasEpisodeAired } from "@/lib/util";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.liveSeries.home.title, data.liveSeries.title),
  };
}

type ShowWithEpisodes = TvMazeShow & { episodes: TvMazeEpisode[] };

export default async function Home() {
  const { data } = await getTranslations();
  const { user } = await getAuth();

  const watchedEpisodes = user?.watchedEpisodes ?? {};
  const likedShowIds: EpisodeArray = user?.userShows?.liked ?? [];
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

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(data.liveSeries.home.title, data.liveSeries.title, false)}
      </h2>
      <h3 className="mb-5 text-2xl font-bold">
        {data.liveSeries.home.likedShows}
        {likedShowIds != null && likedShowIds.length > 0
          ? ` (${likedShowIds.length})`
          : ""}
      </h3>
      {user == null || likedShowIds?.length === 0 ? (
        <Tile className="items-start">
          <p className="mb-3 whitespace-pre-wrap">{data.liveSeries.home.noLikes}</p>
          <p>
            <Link href="/liveseries/search" className="hover-underline text-accent">
              {data.liveSeries.search.label}
            </Link>
          </p>
          <p>
            <Link href="/liveseries/most-popular" className="hover-underline text-accent">
              {data.liveSeries.home.explore} {data.liveSeries.mostPopular.title}{" "}
              {data.liveSeries.home.shows}
            </Link>
          </p>
        </Tile>
      ) : (
        <Tile className="items-start">
          {/* <LikedShowsCarousel
            likedShows={likedShows}
            userLanguage={userLanguage}
            user={user}
          /> */}
          <h3 className="mb-5 text-2xl font-bold">
            {data.liveSeries.tvShow.unwatched} {data.liveSeries.tvShow.episodes}
          </h3>
          {totalUnwatchedEpisodes === 0 ? (
            <p>{data.liveSeries.home.noUnwatched}</p>
          ) : (
            Object.entries(unwatchedEpisodes).map(([showId, unwatchedInShow], idx) =>
              unwatchedInShow.length === 0 ? null : (
                <div key={`liked-show-${showId}-${idx}`}>
                  <EpisodesList
                    tvShow={likedShows[+showId]}
                    heading={`${likedShows[+showId].name} (${unwatchedInShow.length})`}
                    episodes={unwatchedInShow}
                  />
                </div>
              ),
            )
          )}
        </Tile>
      )}
    </>
  );
}

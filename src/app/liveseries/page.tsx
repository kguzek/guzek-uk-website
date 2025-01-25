import Link from "next/link";
import type { Metadata } from "next";
import { EpisodesList } from "@/components/liveseries/episodes-list";
import { ErrorComponent } from "@/components/error-component";
import { LikedShowsCarousel } from "@/components/liveseries/liked-shows-carousel";
import { ErrorCode } from "@/lib/enums";
import type {
  Episode,
  ShowData,
  TvShowDetails,
  WatchedEpisodes,
  LikedShows,
  UserShows,
} from "@/lib/types";
import { getTitle, hasEpisodeAired } from "@/lib/util";
import { useTranslations } from "@/providers/translation-provider";
import { serverToApi } from "@/lib/backend/server";
import { useAuth } from "@/providers/auth-provider";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await useTranslations();
  return {
    title: getTitle(data.liveSeries.home.title, data.liveSeries.title),
  };
}

export default async function Home() {
  const { data, userLanguage } = await useTranslations();
  const { user, accessToken } = await useAuth();

  let watchedEpisodes: ShowData<WatchedEpisodes> = {};
  let likedShowIds: undefined | number[] = undefined;
  const likedShows: LikedShows = {};

  const unwatchedEpisodes: Record<number, Episode[]> = {};
  let totalUnwatchedEpisodes = 0;

  if (user != null) {
    const [showsResult, watchedEpisodesResult] = await Promise.all([
      serverToApi<UserShows>("liveseries/shows/personal"),
      serverToApi<ShowData<WatchedEpisodes>>(
        "liveseries/watched-episodes/personal",
      ),
    ] as const);

    const likedShowsAvailable =
      showsResult.ok && showsResult.data.likedShows != null;

    let likedShowsResults = likedShowsAvailable
      ? await Promise.all(
          showsResult.data.likedShows!.map((showId: number) =>
            serverToApi<{ tvShow: TvShowDetails }>("show-details", {
              params: { q: `${showId}` },
              api: "episodate",
            }),
          ),
        )
      : [];

    if (watchedEpisodesResult.ok) {
      watchedEpisodes = watchedEpisodesResult.data;
    }

    for (const result of likedShowsResults) {
      if (!result.ok) {
        console.error("LiveSeries fetch failed:", likedShowsResults);
        return <ErrorComponent errorCode={ErrorCode.ServerError} />;
      }
      likedShows[result.data.tvShow.id] = result.data.tvShow;
    }

    if (likedShowsAvailable) {
      likedShowIds = showsResult.data.likedShows;

      for (const showId of likedShowIds!) {
        const unwatched = likedShows[showId].episodes.filter(
          (episode) =>
            hasEpisodeAired(episode) &&
            !watchedEpisodes?.[showId]?.[episode.season]?.includes(
              episode.episode,
            ),
        );
        unwatchedEpisodes[showId] = unwatched;
        totalUnwatchedEpisodes += unwatched.length;
      }
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
        <>
          <p className="mb-3 whitespace-pre-wrap">
            {data.liveSeries.home.noLikes}
          </p>
          <p>
            <Link href="/liveseries/search">
              {data.liveSeries.search.label}
            </Link>
          </p>
          <p>
            <Link href="/liveseries/most-popular">
              {data.liveSeries.home.explore} {data.liveSeries.mostPopular.title}{" "}
              {data.liveSeries.home.shows}
            </Link>
          </p>
        </>
      ) : (
        <>
          <LikedShowsCarousel
            likedShowIds={likedShowIds}
            likedShows={likedShows}
            userLanguage={userLanguage}
            accessToken={accessToken}
          />
          <h3 className="mb-5 mt-10 text-2xl font-bold">
            {data.liveSeries.tvShow.unwatched} {data.liveSeries.tvShow.episodes}
          </h3>
          {totalUnwatchedEpisodes === 0 ? (
            <p>{data.liveSeries.home.noUnwatched}</p>
          ) : (
            Object.entries(unwatchedEpisodes).map(
              ([showId, unwatchedInShow], idx) =>
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
        </>
      )}
    </>
  );
}

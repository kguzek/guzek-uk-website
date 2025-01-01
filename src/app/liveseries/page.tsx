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
import { serverToApi } from "@/lib/backend-v2";
import { getCurrentUser } from "@/providers/auth-provider";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await useTranslations();
  return {
    title: getTitle(data.liveSeries.home.title, data.liveSeries.title),
  };
}

export default async function Home() {
  const { data, userLanguage } = await useTranslations();
  const user = await getCurrentUser();

  const [showsResult, watchedEpisodesResult] = await Promise.all([
    serverToApi<UserShows>("liveseries/shows/personal"),
    serverToApi<ShowData<WatchedEpisodes>>(
      "liveseries/watched-episodes/personal",
    ),
  ] as const);

  const likedShowsResults = showsResult.ok
    ? await Promise.all(
        showsResult.data.likedShows?.map((showId: number) =>
          serverToApi<{ tvShow: TvShowDetails }>("show-details", {
            params: { q: `${showId}` },
            api: "episodate",
          }),
        ) ?? [],
      )
    : null;
  if (likedShowsResults?.some((result) => !result.ok)) {
    console.error("LiveSeries fetch failed:", likedShowsResults);
    return <ErrorComponent errorCode={ErrorCode.ServerError} />;
  }

  const likedShows: LikedShows = {};
  let anyLikedShowsFailed = false;
  for (const result of likedShowsResults ?? []) {
    if (!result.ok) {
      anyLikedShowsFailed = true;
      continue;
    }
    likedShows[result.data.tvShow.id] = result.data.tvShow;
  }

  const watchedEpisodes = watchedEpisodesResult.ok
    ? watchedEpisodesResult.data
    : {};

  // useEffect(() => {
  //   if (userShows?.likedShows == null) return;
  //   if (userShows.likedShows.length === Object.keys(likedShows).length) return;
  //   setLikedShows({});
  //   for (const showId of userShows.likedShows) {
  //     fetchResource("show-details", {
  //       params: { q: `${showId}` },
  //       onSuccess: (showData) => {
  //         setLikedShows((old) => ({
  //           ...old,
  //           [showData.tvShow.id]: showData.tvShow,
  //         }));
  //       },
  //     });
  //   }
  // }, [userShows]);

  function getUnwatchedEpisodes(showId: number) {
    const unwatched = likedShows[showId].episodes.filter(
      (episode) =>
        hasEpisodeAired(episode) &&
        !watchedEpisodes?.[showId]?.[episode.season]?.includes(episode.episode),
    );
    if (unwatched.length > 0) unwatchedEpisodesByShowId[showId] = unwatched;
    return unwatched;
  }

  const readyToRenderPreviews =
    !showsResult.ok ||
    anyLikedShowsFailed ||
    Object.keys(likedShows).length === showsResult.data.likedShows?.length;

  const unwatchedEpisodesByShowId: { [showId: number]: Episode[] } = {};

  // TODO: what was this for?
  const loading = [];

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(data.liveSeries.home.title, data.liveSeries.title, false)}
      </h2>
      <h3 className="mb-5 text-2xl font-bold">
        {data.liveSeries.home.likedShows}
        {showsResult.ok && showsResult.data.likedShows
          ? ` (${showsResult.data.likedShows?.length})`
          : ""}
      </h3>
      {user == null ||
      (loading.length === 0 &&
        showsResult.ok &&
        showsResult.data.likedShows?.length === 0) ? (
        <>
          <p className="mb-3 whitespace-pre-wrap">
            {data.liveSeries.home.noLikes}
          </p>
          <p>
            <Link href="search">{data.liveSeries.search.label}</Link>
          </p>
          <p>
            <Link href="most-popular">
              {data.liveSeries.home.explore} {data.liveSeries.mostPopular.title}{" "}
              {data.liveSeries.home.shows}
            </Link>
          </p>
        </>
      ) : (
        <>
          <LikedShowsCarousel
            likedShowIds={
              showsResult.ok ? showsResult.data.likedShows : undefined
            }
            likedShows={likedShows}
            userLanguage={userLanguage}
          />
          {showsResult.ok &&
            showsResult.data.likedShows &&
            readyToRenderPreviews && (
              <>
                <h3>
                  {data.liveSeries.tvShow.unwatched}{" "}
                  {data.liveSeries.tvShow.episodes}
                </h3>
                {showsResult.data.likedShows.map((showId, idx) => {
                  const unwatchedEpisodes = getUnwatchedEpisodes(showId);
                  if (unwatchedEpisodes.length === 0) return null;
                  return (
                    <div key={`liked-show-${showId}-${idx}`}>
                      <EpisodesList
                        tvShow={likedShows[showId]}
                        heading={`${likedShows[showId].name} (${unwatchedEpisodes.length})`}
                        episodes={unwatchedEpisodes}
                      />
                    </div>
                  );
                })}
                {Object.keys(unwatchedEpisodesByShowId).length === 0 && (
                  <p>{data.liveSeries.home.noUnwatched}</p>
                )}
              </>
            )}
        </>
      )}
    </>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import TvShowPreview from "../../components/LiveSeries/TvShowPreview";
import TvShowPreviewSkeleton from "../../components/LiveSeries/TvShowPreviewSkeleton";
import { TvShowDetails } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle, OutletContext } from "./Base";
import Episode from "../../components/LiveSeries/Episode";

const DOWNLOAD_STATES = ["pending", "failed", "downloaded", undefined] as const;

export default function Home({ data }: { data: Translation }) {
  const [likedShows, setLikedShows] = useState<{
    [showId: number]: TvShowDetails;
  }>({});
  const title = getLiveSeriesTitle(data, "home");
  const { likedShowIds, watchedEpisodes, loading, fetchResource } =
    useOutletContext<OutletContext>();

  useEffect(() => {
    setTitle(title);
  }, [data]);

  useEffect(() => {
    if (!likedShowIds) return;
    if (likedShowIds.length === Object.keys(likedShows).length) return;
    setLikedShows([]);
    for (const showId of likedShowIds) {
      fetchResource("show-details", {
        params: { q: `${showId}` },
        onSuccess: (showData) => {
          setLikedShows((old) => ({
            ...old,
            [showData.tvShow.id]: showData.tvShow,
          }));
        },
      });
    }
  }, [likedShowIds]);

  const readyToRenderPreviews =
    Object.keys(likedShows).length === likedShowIds?.length;

  const getUnwatchedEpisodes = (showId: number) =>
    likedShows[showId].episodes.filter(
      (episode) =>
        !watchedEpisodes?.[showId]?.[episode.season]?.includes(episode.episode)
    );

  return (
    <>
      <h2>{title}</h2>
      <h3>Your Liked Shows {likedShowIds ? `(${likedShowIds.length})` : ""}</h3>
      {loading.length > 0 || likedShowIds?.length !== 0 ? (
        <>
          <ul className="previews flex scroll-x">
            {(likedShowIds ?? Array(4).fill(0)).map((showId, idx) => (
              <li key={`home-preview ${showId} ${idx}`}>
                {readyToRenderPreviews ? (
                  <TvShowPreview data={data} showDetails={likedShows[showId]} />
                ) : (
                  <TvShowPreviewSkeleton idx={idx} />
                )}
              </li>
            ))}
          </ul>
          {likedShowIds && readyToRenderPreviews && (
            <>
              <h3>
                {data.liveSeries.tvShow.unwatched}{" "}
                {data.liveSeries.tvShow.episodes}
              </h3>
              {likedShowIds
                .filter((showId) => getUnwatchedEpisodes(showId).length > 0)
                .map((showId, idx) => (
                  <div key={`liked-show-${showId}-${idx}`}>
                    <h4>{likedShows[showId].name}</h4>
                    <div className="episodes flex-wrap">
                      {getUnwatchedEpisodes(showId).map((episode, idx) => (
                        <Episode
                          key={`episode-unwatched-${idx}`}
                          data={data}
                          episode={episode}
                          showId={showId}
                          downloadStatus={
                            DOWNLOAD_STATES[Math.round(Math.random() * 10) % 4]
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </>
          )}
        </>
      ) : (
        <>
          <p>{data.liveSeries.home.noLikes}</p>
          <p>
            <Link to="search">{data.liveSeries.search.label}</Link>
          </p>
          <p>
            <Link to="most-popular">
              {data.liveSeries.home.explore} {data.liveSeries.mostPopular.title}{" "}
              {data.liveSeries.home.shows}
            </Link>
          </p>
        </>
      )}
    </>
  );
}


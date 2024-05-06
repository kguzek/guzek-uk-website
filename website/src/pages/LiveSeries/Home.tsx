import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import TvShowPreview from "../../components/LiveSeries/TvShowPreview";
import TvShowPreviewSkeleton from "../../components/LiveSeries/TvShowPreviewSkeleton";
import { TvShowDetails } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle, OutletContext } from "./Base";

export default function Home({ data }: { data: Translation }) {
  const [likedShows, setLikedShows] = useState<{
    [showId: number]: TvShowDetails;
  }>({});
  const title = getLiveSeriesTitle(data, "home");
  const { likedShowIds, loading, fetchResource } =
    useOutletContext<OutletContext>();

  useEffect(() => {
    setTitle(title);
  }, [data]);

  useEffect(() => {
    if (!likedShowIds) return;
    if (likedShowIds.length === Object.keys(likedShows).length) return;
    setLikedShows([]);
    for (const showId of likedShowIds) {
      console.log("Getting show details for", showId);
      fetchResource("show-details", {
        params: { q: `${showId}` },
        onSuccess: (showData) => {
          console.log("Retrieved", showData);
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

  return (
    <>
      <h2>{title}</h2>
      <h3>Your Liked Shows {likedShowIds ? `(${likedShowIds.length})` : ""}</h3>
      {loading || likedShowIds?.length !== 0 ? (
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


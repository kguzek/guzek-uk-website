import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import TvShowPreview from "../../components/LiveSeries/TvShowPreview";
import TvShowSkeleton from "../../components/LiveSeries/TvShowSkeleton";
import { TvShowDetails } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle, OutletContext } from "./Base";

export default function Home({ data }: { data: Translation }) {
  const [likedShows, setLikedShows] = useState<TvShowDetails[]>([]);
  const title = getLiveSeriesTitle(data, "home");
  const { likedShowIds, loading, fetchResource } =
    useOutletContext<OutletContext>();

  useEffect(() => {
    setTitle(title);
  }, [data]);

  useEffect(() => {
    if (!likedShowIds) return;
    if (likedShowIds.length === likedShows.length) return;
    setLikedShows([]);
    for (const showId of likedShowIds) {
      console.log("Getting show details for", showId);
      fetchResource("show-details", {
        params: { q: `${showId}` },
        onSuccess: (showData) => {
          console.log("Retrieved", showData);
          setLikedShows((old) => [...old, showData.tvShow]);
        },
      });
    }
  }, [likedShowIds]);

  return (
    <>
      <h2>{title}</h2>
      <h3>Your Liked Shows {loading ? "" : `(${likedShows.length})`}</h3>
      {loading || likedShowIds?.length !== 0 ? (
        <ul className="previews flex scroll-x">
          {likedShows.length >= (likedShowIds?.length ?? 0)
            ? likedShows.map((showDetails, idx) => (
                <TvShowPreview
                  key={`home-preview ${showDetails.id} ${idx}`}
                  data={data}
                  showDetails={showDetails}
                />
              ))
            : Array(4)
                .fill(0)
                .map((_, idx) => <TvShowSkeleton key={idx} idx={idx} />)}
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


import React, { useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle, OutletContext } from "./Base";

export default function Home({ data }: { data: Translation }) {
  const title = getLiveSeriesTitle(data, "home");
  const { likedShows, loading } = useOutletContext<OutletContext>();

  useEffect(() => {
    setTitle(title);
  }, [data]);

  return (
    <>
      <h2>{title}</h2>
      {loading ? (
        <LoadingScreen text={data.loading} />
      ) : likedShows?.length ? (
        <>
          Liked Shows
          <ol>
            {likedShows.map((showId) => (
              <li key={showId}>
                <Link to={`tv-show/${showId}`}>{showId}</Link>
              </li>
            ))}
          </ol>
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


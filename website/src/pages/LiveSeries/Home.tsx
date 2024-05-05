import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle } from "./Base";

export default function Home({ data }: { data: Translation }) {
  const title = getLiveSeriesTitle(data, "home");

  useEffect(() => {
    setTitle(title);
  }, [data]);

  return (
    <>
      <h2>{title}</h2>
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
  );
}


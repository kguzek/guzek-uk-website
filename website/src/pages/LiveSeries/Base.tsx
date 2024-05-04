import React, { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Translation } from "../../misc/translations";
import "../../styles/liveseries.css";

export default function Base({ data }: { data: Translation }) {
  useEffect(() => {}, []);

  return (
    <>
      <div className="text liveseries">
        <nav className="liveseries-links serif">
          <Link className="clickable nav-link" to="">
            {data.liveSeries.home.title}
          </Link>
          <Link className="clickable nav-link" to="search">
            {data.liveSeries.search.title}
          </Link>
          <Link className="clickable nav-link" to="most-popular">
            {data.liveSeries.mostPopular.title}
          </Link>
        </nav>
        <Outlet />
      </div>
    </>
  );
}

export const getLiveSeriesTitle = (
  data: Translation,
  page: keyof Omit<Translation["liveSeries"], "title" | "tvShowList">
) => `${data.liveSeries[page].title} – ${data.liveSeries.title}`;


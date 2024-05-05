import React, { useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Translation } from "../../misc/translations";
import "../../styles/liveseries.css";

export default function Base({ data }: { data: Translation }) {
  const location = useLocation();

  const activeClassName = (path?: string) =>
    (
      path
        ? location.pathname.startsWith("/liveseries/" + path)
        : ["/liveseries", "/liveseries/"].includes(location.pathname)
    )
      ? " active"
      : "";

  return (
    <>
      <div className="text liveseries">
        <nav className="liveseries-links serif flex">
          <Link className={"clickable nav-link" + activeClassName()} to="">
            {data.liveSeries.home.title}
          </Link>
          <Link
            className={"clickable nav-link" + activeClassName("search")}
            to="search"
          >
            {data.liveSeries.search.title}
          </Link>
          <Link
            className={"clickable nav-link" + activeClassName("most-popular")}
            to="most-popular"
          >
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


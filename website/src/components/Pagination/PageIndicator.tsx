import React from "react";
import { Link } from "react-router-dom";

export default function PageIndicator({
  page,
  currentPage,
}: {
  page: number | string;
  currentPage: number;
}) {
  function getLinkLocation() {
    const search = document.location.search;
    const oldFragment = `page=${currentPage}`;
    const newFragment = `page=${page}`;
    if (!search) return "?" + newFragment;
    if (search.includes(oldFragment))
      return search.replace(oldFragment, newFragment);
    return search + "&" + newFragment;
  }

  if (typeof page === "string") {
    return <div className="page-indicator disabled">{page}</div>;
  }

  return (
    <Link
      className={`page-indicator ${page === currentPage ? "current-page" : ""}`}
      to={getLinkLocation()}
    >
      {page}
    </Link>
  );
}


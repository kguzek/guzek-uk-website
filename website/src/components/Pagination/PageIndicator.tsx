import React from "react";
import { Link } from "react-router-dom";
import { Translation } from "../../misc/translations";

export default function PageIndicator({
  data,
  page,
  currentPage,
}: {
  data: Translation;
  page?: number;
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

  if (null == page) {
    return <div className="page-indicator disabled">...</div>;
  }

  return (
    <Link
      className={`page-indicator serif ${
        page === currentPage ? "current-page" : ""
      }`}
      to={getLinkLocation()}
    >
      {data.numberFormat.format(page)}
    </Link>
  );
}


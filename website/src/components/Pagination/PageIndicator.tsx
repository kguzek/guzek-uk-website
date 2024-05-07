import React from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { Translation } from "../../misc/translations";
import { OutletContext } from "../../pages/LiveSeries/Base";

const pagePattern = /page=\d+/;

export default function PageIndicator({
  data,
  page,
  currentPage,
  direction,
  disabled = false,
}: {
  data: Translation;
  page?: number;
  currentPage: number;
  direction?: "PREVIOUS" | "NEXT";
  disabled?: boolean;
}) {
  const { loading } = useOutletContext<OutletContext>();
  const [searchParams] = useSearchParams();

  function getNewSearchParams() {
    const search = searchParams.toString();
    const newFragment = `page=${page}`;
    if (!search) return newFragment;
    if (search.match(pagePattern))
      return search.replace(pagePattern, newFragment);
    return search + "&" + newFragment;
  }
  let displayValue;

  if (null == page) {
    if (!direction) return <div className="page-indicator disabled">...</div>;
    [displayValue, page] =
      direction === "PREVIOUS"
        ? ["<", currentPage - 1]
        : [">", currentPage + 1];
  } else {
    displayValue = data.numberFormat.format(page);
  }

  return (
    <Link
      className={`page-indicator serif ${
        disabled ? "disabled" : page === currentPage ? "current-page" : ""
      } ${direction ? "auxiliary" : ""}`}
      to={disabled ? "#" : "?" + getNewSearchParams()}
      onClick={(evt) => {
        (loading.length > 0 || disabled) && evt.preventDefault();
      }}
    >
      {displayValue}
    </Link>
  );
}


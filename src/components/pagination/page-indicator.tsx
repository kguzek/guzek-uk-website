"use client";

import Link from "next/link";
import { useLiveSeries } from "@/context/liveseries-context";
import { useTranslations } from "@/context/translation-context";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const pagePattern = /page=\d+/;

interface PageIndicatorProps {
  page?: number;
  currentPage: number;
  direction?: "PREVIOUS" | "NEXT";
  disabled?: boolean;
}

function PageIndicator({
  page,
  currentPage,
  direction,
  disabled = false,
  search = "",
}: PageIndicatorProps & {
  search?: string;
}) {
  const { data } = useTranslations();
  let loading = [];
  try {
    ({ loading } = useLiveSeries());
  } catch (error) {
    console.warn("PageIndicator is not inside a LiveSeriesProvider");
    console.error(error);
  }

  function getNewSearchParams() {
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
      href={disabled ? "#" : "?" + getNewSearchParams()}
      className={`page-indicator serif ${
        disabled ? "disabled" : page === currentPage ? "current-page" : ""
      } ${direction ? "auxiliary" : ""}`}
      onClick={(evt) => {
        (loading.length > 0 || disabled) && evt.preventDefault();
      }}
    >
      {displayValue}
    </Link>
  );
}

export default function SuspendedPageIndicator(props: PageIndicatorProps) {
  return (
    <Suspense fallback={<PageIndicator {...props} />}>
      <PageIndicator {...props} search={useSearchParams().toString()} />
    </Suspense>
  );
}

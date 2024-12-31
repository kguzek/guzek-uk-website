"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TvShowPreviewList from "@/components/liveseries/tv-show-preview-list";
import { TvShowList } from "@/lib/types";
import { setTitle } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";
import { useLiveSeries } from "@/context/liveseries-context";
import { getLiveSeriesTitle } from "../layout-client";

export function SearchResults() {
  const [results, setResults] = useState<null | TvShowList>(null);
  const searchParams = useSearchParams();
  const { data } = useTranslations();
  const { fetchResource } = useLiveSeries();

  const searchQuery = searchParams.get("q");
  const resultsLabel = `${data.liveSeries.search.results} "${searchQuery}"`;
  const title = getLiveSeriesTitle("search");

  useEffect(() => {
    const newTitle = searchQuery ? resultsLabel : title;
    setTitle(newTitle);
  }, [data, searchParams]);

  useEffect(() => {
    if (!searchQuery) return;
    fetchResource("search", { onSuccess: setResults });

    if (!results) return;
    const searchedPage = +(searchParams.get("page") ?? "");
    if (searchedPage === results.page) return;

    // Predictively update the page number in the old data
    setResults({ ...results, page: searchedPage });
  }, [searchParams]);

  if (!searchQuery) return null;

  return (
    <>
      <h3>{resultsLabel}</h3>
      <TvShowPreviewList tvShows={results ?? undefined} />
    </>
  );
}

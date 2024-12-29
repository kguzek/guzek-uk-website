import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TvShowPreviewList from "@/components/liveseries/tv-show-preview-list";
import { TvShowList } from "@/lib/models";
import { setTitle } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";
import { useLiveSeries } from "@/context/liveseries-context";
import { getLiveSeriesTitle } from "../layout";

export default function MostPopular() {
  const [results, setResults] = useState<TvShowList | null>(null);
  const searchParams = useSearchParams();
  const { data } = useTranslations();
  const { fetchResource } = useLiveSeries();

  const title = getLiveSeriesTitle("mostPopular");

  useEffect(() => {
    setTitle(title);
  }, [data]);

  useEffect(() => {
    const searchedPage = +(searchParams.get("page") ?? "");
    if (searchedPage === results?.page) return;

    // Predictively update the page number in the old data
    setResults((old) => old && { ...old, page: searchedPage });
    fetchResource("most-popular", { onSuccess: setResults });
  }, [searchParams]);

  return (
    <>
      <h2>{title}</h2>
      <TvShowPreviewList tvShows={results ?? undefined} />
    </>
  );
}

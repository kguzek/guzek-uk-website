import React, { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import TvShowPreviewList from "../../components/LiveSeries/TvShowPreviewList";
import { TvShowList } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle, OutletContext } from "./Base";

export default function MostPopular({ data }: { data: Translation }) {
  const [results, setResults] = useState<TvShowList | null>(null);

  const [searchParams] = useSearchParams();
  const { fetchResource } = useOutletContext<OutletContext>();

  const title = getLiveSeriesTitle(data, "mostPopular");

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
      <TvShowPreviewList data={data} tvShows={results ?? undefined} />
    </>
  );
}


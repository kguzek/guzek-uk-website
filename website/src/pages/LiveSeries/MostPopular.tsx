import React, { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import TvShowPreviewList from "../../components/LiveSeries/TvShowPreviewList";
import LoadingScreen from "../../components/LoadingScreen";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle, OutletContext } from "./Base";

export default function MostPopular({ data }: { data: Translation }) {
  const [results, setResults] = useState(null);

  const [searchParams] = useSearchParams();
  const { loading, fetchResource } = useOutletContext<OutletContext>();

  const title = getLiveSeriesTitle(data, "mostPopular");

  useEffect(() => {
    setTitle(title);
  }, [data]);

  useEffect(() => {
    if (loading) return;

    fetchResource("most-popular", { onSuccess: setResults });
  }, [searchParams]);

  return (
    <>
      <h2>{title}</h2>
      {loading ? (
        <div className="centred">
          <LoadingScreen text={data.loading} />
        </div>
      ) : results ? (
        <TvShowPreviewList data={data} tvShows={results} />
      ) : null}
    </>
  );
}


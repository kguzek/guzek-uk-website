import React, { useContext, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { TvShowList } from "../../misc/models";
import { TranslationContext } from "../../misc/context";
import { LiveSeriesOutletContext } from "../../pages/LiveSeries/Base";
import Paginator from "../Pagination/Paginator";
import TvShowPreview from "./TvShowPreview";
import { NumericValue } from "../NumericValue";

const RESULTS_PER_PAGE = 20;

const DUMMY_TV_SHOWS = {
  page: 1,
  total: "200",
  pages: 10,
  tv_shows: Array(20).fill(0),
};

export default function TvShowPreviewList({
  tvShows: tvShowsRaw,
}: {
  tvShows?: TvShowList;
}) {
  const [cardsToLoad, setCardsToLoad] = useState<number[]>([]);
  const data = useContext(TranslationContext);
  const { loading } = useOutletContext<LiveSeriesOutletContext>();

  useEffect(() => {
    if (!tvShowsRaw) return;
    setCardsToLoad(tvShowsRaw.tv_shows.map((show) => show.id));
  }, [tvShowsRaw]);

  const tvShows = tvShowsRaw ?? DUMMY_TV_SHOWS;

  const startIdx = 1 + (tvShows.page - 1) * RESULTS_PER_PAGE;
  const endIdx = Math.min(+tvShows.total, startIdx + RESULTS_PER_PAGE - 1);

  if (tvShowsRaw?.total === "0")
    return <p>{data.liveSeries.search.noResults}</p>;

  return (
    <div className="shows-list flex-column">
      <small className="showing">
        {data.liveSeries.tvShowList.showing} <NumericValue value={startIdx} />-
        <NumericValue value={endIdx} /> {data.liveSeries.tvShowList.of}{" "}
        <NumericValue value={tvShows.total} />
      </small>
      <Paginator currentPage={tvShows.page} numPages={tvShows.pages} />
      <div className="previews-list">
        {tvShows.tv_shows.map((showDetails, idx) => (
          <TvShowPreview
            key={`tv-show-${showDetails.id}-${idx}`}
            idx={idx % 8}
            showDetails={tvShowsRaw ? showDetails : undefined}
            ready={
              cardsToLoad.length === 0 &&
              null != tvShowsRaw &&
              loading.length === 0
            }
            onLoad={() =>
              setCardsToLoad((old) =>
                old.filter((value) => value !== showDetails.id)
              )
            }
          />
        ))}
      </div>
      <Paginator currentPage={tvShows.page} numPages={tvShows.pages} />
    </div>
  );
}


import React from "react";
import { useOutletContext } from "react-router-dom";
import { TvShowList } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { OutletContext } from "../../pages/LiveSeries/Base";
import Paginator from "../Pagination/Paginator";
import TvShowPreview from "./TvShowPreview";
import TvShowPreviewSkeleton from "./TvShowPreviewSkeleton";

const RESULTS_PER_PAGE = 20;

const DUMMY_TV_SHOWS = { page: 1, total: "200", pages: 10, tv_shows: [] };

export default function TvShowPreviewList({
  data,
  tvShows: tvShowsRaw,
}: {
  data: Translation;
  tvShows?: TvShowList;
}) {
  const { loading } = useOutletContext<OutletContext>();

  const NumericValue = ({ value }: { value: number | string }) => (
    <span className="serif">{data.numberFormat.format(+value)}</span>
  );

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
      <Paginator
        data={data}
        currentPage={tvShows.page}
        numPages={tvShows.pages}
      />
      <div className="previews-list">
        {tvShowsRaw && loading.length === 0
          ? tvShows.tv_shows.map((showDetails) => (
              <TvShowPreview
                key={"tvShow-" + showDetails.id}
                data={data}
                showDetails={showDetails}
              />
            ))
          : Array(20)
              .fill(0)
              .map((_, idx) => (
                <TvShowPreviewSkeleton key={idx} idx={idx % 8} />
              ))}
      </div>
      <Paginator
        data={data}
        currentPage={tvShows.page}
        numPages={tvShows.pages}
      />
    </div>
  );
}


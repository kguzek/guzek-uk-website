import React from "react";
import { TvShowList } from "../../misc/models";
import { Translation } from "../../misc/translations";
import Paginator from "../Pagination/Paginator";
import TvShowPreview from "./TvShowPreview";

const RESULTS_PER_PAGE = 20;

export default function TvShowPreviewList({
  data,
  tvShows,
}: {
  data: Translation;
  tvShows: TvShowList;
}) {
  const startIdx = 1 + (tvShows.page - 1) * RESULTS_PER_PAGE;
  const endIdx = Math.min(+tvShows.total, startIdx + RESULTS_PER_PAGE - 1);

  if (!tvShows.total || tvShows.total === "0") return <p>No results.</p>;
  return (
    <div className="tvshows-list flex-column">
      <small className="showing">
        {data.liveSeries.tvShowList.showing} {startIdx}-{endIdx}{" "}
        {data.liveSeries.tvShowList.of} {tvShows.total}
      </small>
      <Paginator currentPage={tvShows.page} numPages={tvShows.pages} />
      <div className="previews">
        {tvShows.tv_shows.map((showDetails) => (
          <TvShowPreview
            key={"tvShow-" + showDetails.id}
            data={data}
            showDetails={showDetails}
          />
        ))}
      </div>
      <Paginator currentPage={tvShows.page} numPages={tvShows.pages} />
    </div>
  );
}


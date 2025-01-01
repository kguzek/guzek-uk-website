import { Language } from "@/lib/enums";
import type { TvShowList } from "@/lib/types";
import { Paginator } from "@/components/pagination/paginator";
import { NumericValue } from "@/components/numeric-value";
import { TvShowPreview } from "./tv-show-preview";
import { TRANSLATIONS } from "@/lib/translations";

const RESULTS_PER_PAGE = 20;

const DUMMY_TV_SHOWS = {
  page: 1,
  total: "200",
  pages: 10,
  tv_shows: Array(20).fill(0),
};

export async function TvShowPreviewList({
  tvShows: tvShowsRaw,
  userLanguage,
}: {
  tvShows?: TvShowList;
  userLanguage: Language;
}) {
  const data = TRANSLATIONS[userLanguage];

  const tvShows = tvShowsRaw ?? DUMMY_TV_SHOWS;

  const startIdx = 1 + (tvShows.page - 1) * RESULTS_PER_PAGE;
  const endIdx = Math.min(+tvShows.total, startIdx + RESULTS_PER_PAGE - 1);

  if (tvShowsRaw?.total === "0")
    return <p>{data.liveSeries.search.noResults}</p>;

  return (
    <div className="flex flex-col items-center">
      <small className="showing">
        {data.liveSeries.tvShowList.showing} <NumericValue value={startIdx} />-
        <NumericValue value={endIdx} /> {data.liveSeries.tvShowList.of}{" "}
        <NumericValue value={tvShows.total} />
      </small>
      <Paginator currentPage={tvShows.page} numPages={tvShows.pages} />
      <div className="cards-grid my-3 grid w-full justify-center gap-4">
        {tvShows.tv_shows.map((showDetails, idx) => (
          <TvShowPreview
            key={`tv-show-${showDetails.id}-${idx}`}
            idx={idx % 8}
            showDetails={tvShowsRaw ? showDetails : undefined}
          />
        ))}
      </div>
      <Paginator currentPage={tvShows.page} numPages={tvShows.pages} />
    </div>
  );
}

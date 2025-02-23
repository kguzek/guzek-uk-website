import type { Language } from "@/lib/enums";
import type { TvShowList, UserShows } from "@/lib/types";
import { NumericValue } from "@/components/numeric-value";
import { Paginator } from "@/components/pagination/paginator";
import { serverToApi } from "@/lib/backend/server";
import { getAuth } from "@/lib/providers/auth-provider";
import { TRANSLATIONS } from "@/lib/translations";

import { TvShowPreview } from "./tv-show-preview";

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

  // The API used to return a string but now it returns a number. Using this to be safe.
  if (tvShowsRaw?.total?.toString() === "0") {
    return <p>{data.liveSeries.search.noResults}</p>;
  }
  const { accessToken } = await getAuth();
  const userShowsResult = await serverToApi<UserShows>("liveseries/shows/personal");
  const likedShowIds = (userShowsResult.ok && userShowsResult.data.likedShows) || [];

  const paginator = <Paginator currentPage={tvShows.page} totalPages={tvShows.pages} />;

  return (
    <div className="flex flex-col items-center">
      <small className="self-start">
        {data.liveSeries.tvShowList.showing} <NumericValue value={startIdx} />-
        <NumericValue value={endIdx} /> {data.liveSeries.tvShowList.of}{" "}
        <NumericValue value={tvShows.total} />
      </small>
      {paginator}
      <div className="cards-grid my-3 grid w-full justify-center gap-4">
        {tvShows.tv_shows.map((showDetails, idx) => (
          <TvShowPreview
            key={`tv-show-${showDetails.id}-${idx}`}
            idx={idx % 8}
            showDetails={tvShowsRaw ? showDetails : undefined}
            userLanguage={userLanguage}
            accessToken={accessToken}
            isLiked={likedShowIds.includes(showDetails.id)}
          />
        ))}
      </div>
      {paginator}
    </div>
  );
}

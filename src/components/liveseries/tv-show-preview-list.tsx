import type { Show as TvMazeShow } from "tvmaze-wrapper-ts";
import { getTranslations } from "next-intl/server";

import { NumericValue } from "@/components/numeric-value";
import { Paginator } from "@/components/pagination/paginator";
import { getAuth } from "@/lib/providers/auth-provider";

import { Tile } from "../tile";
import { TvShowPreview } from "./tv-show-preview";

export const RESULTS_PER_PAGE = 25;

export async function TvShowPreviewList({
  tvShows,
  page,
  total,
}: {
  tvShows: TvMazeShow[];
  page: number;
  total: number;
}) {
  const t = await getTranslations();

  const startIdx = 1 + (page - 1) * RESULTS_PER_PAGE;
  const endIdx = Math.min(total, startIdx + RESULTS_PER_PAGE - 1);

  const { user } = await getAuth();

  const paginator = (
    <Paginator currentPage={page} totalPages={Math.ceil(total / RESULTS_PER_PAGE)} />
  );

  // The API used to return a string but now it returns a number. Using this to be safe.
  if (tvShows.length === 0) {
    return (
      <div className="grid place-items-center gap-4">
        {paginator}
        <Tile glow>
          <p>{t("liveSeries.search.noResults")}</p>
        </Tile>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <small className="self-start">
        {t("liveSeries.tvShowList.showing")} <NumericValue value={startIdx} />-
        <NumericValue value={endIdx} /> {t("liveSeries.tvShowList.of")}{" "}
        <NumericValue value={total} />
      </small>
      {paginator}
      <div className="cards-grid my-3 grid w-full justify-center gap-4">
        {tvShows.map((tvShow, idx) => (
          <TvShowPreview
            key={`tv-show-${tvShow.id}-${idx}`}
            idx={idx % 8}
            tvShow={tvShow}
            user={user}
          />
        ))}
      </div>
      {paginator}
    </div>
  );
}

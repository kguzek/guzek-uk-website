import type { Show as TvMazeShow } from "tvmaze-wrapper-ts";
import { getAllShows } from "tvmaze-wrapper-ts";

import { ErrorComponent } from "@/components/error/component";
import {
  RESULTS_PER_PAGE,
  TvShowPreviewList,
} from "@/components/liveseries/tv-show-preview-list";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle, isNumber } from "@/lib/util";

const RESULTS_PER_PAGE_FROM_API = 250;

export async function generateMetadata() {
  const { data } = await getTranslations();
  return {
    title: data.liveSeries.mostPopular.title,
  };
}

export default async function MostPopular({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { data, userLanguage } = await getTranslations();
  const { page: pageString } = await params;
  if (!isNumber(pageString)) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }

  const pageFrontend = +pageString;
  // Pages in TVmaze API are 0-indexed
  const pageBackend =
    Math.ceil((pageFrontend * RESULTS_PER_PAGE) / RESULTS_PER_PAGE_FROM_API) - 1;

  const startIdx = ((pageFrontend - 1) * RESULTS_PER_PAGE) % RESULTS_PER_PAGE_FROM_API;
  let results: TvMazeShow[] = [];
  try {
    const allResults = await getAllShows(pageBackend);
    results = allResults.slice(startIdx, startIdx + RESULTS_PER_PAGE);
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
  // if (result.ok && result.data.page !== +page) {
  //   redirect(`./${result.data.page}`);
  // }

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(data.liveSeries.mostPopular.title, data.liveSeries.title)}
      </h2>
      <TvShowPreviewList
        userLanguage={userLanguage}
        tvShows={results}
        page={pageFrontend}
        // TODO: obtain this value from the API
        total={83085} // https://api.tvmaze.com/shows?page=332 at the time of writing
      />
    </>
  );
}

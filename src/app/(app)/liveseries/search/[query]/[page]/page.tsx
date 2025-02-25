import type { Metadata } from "next";
import type { Show as TvMazeShow } from "tvmaze-wrapper-ts";
import { searchShows } from "tvmaze-wrapper-ts";

import { ErrorComponent } from "@/components/error/component";
import { TvShowPreviewList } from "@/components/liveseries/tv-show-preview-list";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle, isNumber } from "@/lib/util";

import { SearchForm } from "../../form";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}): Promise<Metadata> {
  const { data } = await getTranslations();
  const params = await searchParams;

  const title = params.q
    ? `${data.liveSeries.search.results} "${params.q}"`
    : data.liveSeries.search.title;

  return {
    title: getTitle(title, data.liveSeries.title),
  };
}

async function SearchResults({ query, page }: { query: string; page: `${number}` }) {
  const { data, userLanguage } = await getTranslations();

  const decodedQuery = decodeURIComponent(query);

  let tvShows: TvMazeShow[] = [];
  try {
    const results = await searchShows(decodedQuery);
    tvShows = results.map((result) => result.show);
  } catch (error) {
    console.error("Error fetching search results:", error);
  }

  // if (results?.page !== +page) {
  //   redirect(`./${results.data.page}`);
  // }

  return (
    <>
      <h3 className="my-5 text-2xl font-bold">
        {data.liveSeries.search.results} {data.format.quote(decodedQuery)}
      </h3>
      <TvShowPreviewList
        tvShows={tvShows}
        userLanguage={userLanguage}
        page={+page}
        total={1}
      />
    </>
  );
}

export default async function Search({
  params,
}: {
  params: Promise<{ query: string; page: string }>;
}) {
  const { userLanguage } = await getTranslations();
  const { query, page } = await params;
  if (!isNumber(page)) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }

  return (
    <>
      <SearchForm userLanguage={userLanguage} />
      <SearchResults query={query} page={page} />
    </>
  );
}

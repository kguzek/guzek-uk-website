import type { Metadata } from "next";
import type { Show as TvMazeShow } from "tvmaze-wrapper-ts";
import { searchShows } from "tvmaze-wrapper-ts";

import { ErrorComponent } from "@/components/error/component";
import { TvShowPreviewList } from "@/components/liveseries/tv-show-preview-list";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";
import { isNumber } from "@/lib/util";

import { SearchForm } from "../../form";

interface SearchProps {
  params: Promise<{ query: string; page: string }>;
}

export async function generateMetadata({ params }: SearchProps): Promise<Metadata> {
  const { data } = await getTranslations();
  const { query, page } = await params;

  const title = query
    ? `${data.liveSeries.search.results} ${data.format.quote(query)} (${data.liveSeries.tvShowList.page} ${page})`
    : data.liveSeries.search.title;

  return {
    title,
  } satisfies Metadata;
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

export default async function Search({ params }: SearchProps) {
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

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import type { TvShowList } from "@/lib/types";
import { ErrorComponent } from "@/components/error/component";
import { TvShowPreviewList } from "@/components/liveseries/tv-show-preview-list";
import { serverToApi } from "@/lib/backend/server";
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

  const result = await serverToApi<TvShowList>("search", {
    api: "episodate",
    params: { q: decodedQuery, page },
  });
  if (result.ok && result.data.page !== +page) {
    redirect(`./${result.data.page}`);
  }

  return (
    <>
      <h3 className="my-5 text-2xl font-bold">
        {data.liveSeries.search.results} {data.format.quote(decodedQuery)}
      </h3>
      <TvShowPreviewList tvShows={result.data ?? undefined} userLanguage={userLanguage} />
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

import { Metadata } from "next";

import { TvShowPreviewList } from "@/components/liveseries/tv-show-preview-list";
import { serverToApi } from "@/lib/backend/server";
import { TvShowList } from "@/lib/types";
import { getTitle } from "@/lib/util";
import { useTranslations } from "@/providers/translation-provider";

import { SearchForm } from "./search-form";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}): Promise<Metadata> {
  const { data } = await useTranslations();
  const params = await searchParams;

  const title = params.q
    ? `${data.liveSeries.search.results} "${params.q}"`
    : data.liveSeries.search.title;

  return {
    title: getTitle(title, data.liveSeries.title),
  };
}

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const { data, userLanguage } = await useTranslations();
  const params = await searchParams;

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(data.liveSeries.search.title, data.liveSeries.title, false)}
      </h2>
      <SearchForm userLanguage={userLanguage} />
      {params.q && <SearchResults params={params} />}
    </>
  );
}

async function SearchResults({ params }: { params: Record<string, string> }) {
  const { data, userLanguage } = await useTranslations();

  const result = await serverToApi<TvShowList>("search", {
    api: "episodate",
    params: { q: params.q },
  });

  return (
    <>
      <h3>{`${data.liveSeries.search.results} "${params.q}"`}</h3>
      <TvShowPreviewList
        tvShows={result.data ?? undefined}
        userLanguage={userLanguage}
        searchParams={params}
      />
    </>
  );
}

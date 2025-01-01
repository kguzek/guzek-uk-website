import { useTranslations } from "@/providers/translation-provider";
import { SearchForm } from "./search-form";
import { serverToApi } from "@/lib/backend-v2";
import { TvShowList } from "@/lib/types";
import { TvShowPreviewList } from "@/components/liveseries/tv-show-preview-list";
import { getTitle } from "@/lib/util";
import { Metadata } from "next";

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

  const result = params.q
    ? await serverToApi<TvShowList>("search", {
        api: "episodate",
        params: { q: params.q },
      })
    : null;

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(data.liveSeries.search.title, data.liveSeries.title, false)}
      </h2>
      <SearchForm userLanguage={userLanguage} />
      {params.q && <h3>{`${data.liveSeries.search.results} "${params.q}"`}</h3>}
      {result && (
        <TvShowPreviewList
          tvShows={result.ok ? result.data : undefined}
          userLanguage={userLanguage}
        />
      )}
    </>
  );
}

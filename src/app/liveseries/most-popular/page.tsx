import { TvShowPreviewList } from "@/components/liveseries/tv-show-preview-list";
import { serverToApi } from "@/lib/backend/server";
import { TvShowList } from "@/lib/types";
import { getTitle } from "@/lib/util";
import { useTranslations } from "@/providers/translation-provider";

export async function generateMetadata() {
  const { data } = await useTranslations();
  return {
    title: getTitle(data.liveSeries.mostPopular.title, data.liveSeries.title),
  };
}

export default async function MostPopular({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const { data, userLanguage } = await useTranslations();
  const params = await searchParams;

  const result = await serverToApi<TvShowList>("most-popular", {
    api: "episodate",
    params: { page: params.page || "1" },
  });

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(
          data.liveSeries.mostPopular.title,
          data.liveSeries.title,
          false,
        )}
      </h2>
      <TvShowPreviewList
        userLanguage={userLanguage}
        tvShows={result.ok ? result.data : undefined}
        searchParams={params}
      />
    </>
  );
}

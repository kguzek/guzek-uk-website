import { redirect } from "next/navigation";

import type { TvShowList } from "@/lib/types";
import { ErrorComponent } from "@/components/error/component";
import { TvShowPreviewList } from "@/components/liveseries/tv-show-preview-list";
import { serverToApi } from "@/lib/backend/server";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle, isNumber } from "@/lib/util";

export async function generateMetadata() {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.liveSeries.mostPopular.title, data.liveSeries.title),
  };
}

export default async function MostPopular({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { data, userLanguage } = await getTranslations();
  const { page } = await params;
  if (!isNumber(page)) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }

  const result = await serverToApi<TvShowList>("most-popular", {
    api: "episodate",
    params: { page },
  });
  if (result.ok && result.data.page !== +page) {
    redirect(`./${result.data.page}`);
  }

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(data.liveSeries.mostPopular.title, data.liveSeries.title, false)}
      </h2>
      <TvShowPreviewList
        userLanguage={userLanguage}
        tvShows={result.ok ? result.data : undefined}
      />
    </>
  );
}

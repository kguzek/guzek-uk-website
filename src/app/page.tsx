import { DynamicPageLoader } from "@/components/pages/dynamic-page";
import { getTitle } from "@/lib/util";
import { useTranslations } from "@/providers/translation-provider";

export async function generateMetadata() {
  const { data } = await useTranslations();
  // TODO: ehh don't use the LiveSeries title here
  return {
    title: getTitle(data.liveSeries.home.title),
  };
}

export default function Index() {
  return <DynamicPageLoader page="/" />;
}

import {
  DynamicPageLoader,
  getPageBySlug,
} from "@/components/pages/dynamic-page";
import { ErrorCode } from "@/lib/enums";
import { getTitle } from "@/lib/util";
import { useTranslations } from "@/providers/translation-provider";

type Props = {
  params: Promise<{ page: string[] }>;
};

const pageFromParams = async ({ params }: Props) =>
  `/${(await params).page.join("/")}`;

export async function generateMetadata(props: Props) {
  const { data } = await useTranslations();
  const currentPage = await getPageBySlug(await pageFromParams(props));
  return {
    title: getTitle(currentPage?.title || data.error[ErrorCode.NotFound].title),
  };
}

export default async function Page(props: Props) {
  return <DynamicPageLoader page={await pageFromParams(props)} />;
}

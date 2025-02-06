import {
  DynamicPageLoader,
  getPageBySlug,
} from "@/components/pages/dynamic-page";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle } from "@/lib/util";

type Props = {
  params: Promise<{ page: string[] }>;
};

const pageFromParams = async ({ params }: Props) =>
  `/${(await params).page.join("/")}`;

export async function generateMetadata(props: Props) {
  const { data } = await getTranslations();
  const currentPage = await getPageBySlug(await pageFromParams(props));
  return {
    title: getTitle(currentPage?.title || data.error[ErrorCode.NotFound].title),
  };
}

export default async function Page(props: Props) {
  return <DynamicPageLoader page={await pageFromParams(props)} />;
}

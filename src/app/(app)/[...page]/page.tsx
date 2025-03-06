import type { Metadata } from "next";

import { DynamicPageLoader, getPageBySlug } from "@/components/pages/dynamic-page";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";

type Props = {
  params: Promise<{ page: string[] }>;
};

const slugFromParams = async ({ params }: Props) => `/${(await params).page.join("/")}`;

export async function generateMetadata(props: Props) {
  const { data } = await getTranslations();
  const currentPage = await getPageBySlug(await slugFromParams(props));
  return {
    title:
      currentPage?.seoTitle || currentPage?.title || data.error[ErrorCode.NotFound].title,
  } satisfies Metadata;
}

export default async function Page(props: Props) {
  return <DynamicPageLoader slug={await slugFromParams(props)} />;
}

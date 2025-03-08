import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { DynamicPageLoader, getPageBySlug } from "@/components/pages/dynamic-page";

type Props = {
  params: Promise<{ page: string[] }>;
};

const slugFromParams = async ({ params }: Props) => `/${(await params).page.join("/")}`;

export async function generateMetadata(props: Props) {
  const t = await getTranslations();
  const currentPage = await getPageBySlug(await slugFromParams(props));
  return {
    title: currentPage?.seoTitle || currentPage?.title || t("error.404.title"),
  } satisfies Metadata;
}

export default async function Page(props: Props) {
  return <DynamicPageLoader slug={await slugFromParams(props)} />;
}

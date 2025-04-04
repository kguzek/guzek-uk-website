import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { DraftModeProps } from "@/lib/types";
import { DynamicPageLoader, getPageBySlug } from "@/components/pages/dynamic-page";

interface Props extends DraftModeProps {
  params: Promise<{ page: string[] }>;
}

const propsToSlug = async (props: Props) => `/${(await props.params).page.join("/")}`;

export async function generateMetadata(props: Props) {
  const t = await getTranslations();
  const searchParams = await props.searchParams;
  const currentPage = await getPageBySlug(
    await propsToSlug(props),
    searchParams.draftMode,
  );
  return {
    title: currentPage?.seoTitle || currentPage?.title || t("error.404.title"),
  } satisfies Metadata;
}

export default async function Page(props: Props) {
  return <DynamicPageLoader slug={await propsToSlug(props)} />;
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SearchForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("liveSeries.search.title"),
  };
}

export default async function SearchPageRedirect() {
  return <SearchForm />;
}

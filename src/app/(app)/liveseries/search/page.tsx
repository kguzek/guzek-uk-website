import type { Metadata } from "next";

import { getTranslations } from "@/lib/providers/translation-provider";

import { SearchForm } from "./form";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: data.liveSeries.search.title,
  };
}

export default async function SearchPageRedirect() {
  const { userLanguage } = await getTranslations();
  return <SearchForm userLanguage={userLanguage} />;
}

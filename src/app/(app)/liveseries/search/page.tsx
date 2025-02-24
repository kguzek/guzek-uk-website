import { getTranslations } from "@/lib/providers/translation-provider";

import { SearchForm } from "./form";

export default async function SearchPageRedirect() {
  const { userLanguage } = await getTranslations();
  return <SearchForm userLanguage={userLanguage} />;
}

import { cookies } from "next/headers";

import { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";

const DEFAULT_LANGUAGE = Language.EN;

export async function getTranslations() {
  const cookieStore = await cookies();
  let language = DEFAULT_LANGUAGE;
  const languageString = cookieStore.get("lang")?.value;
  // console.debug("Language cookie value:", languageString);
  if (languageString && languageString in Language) {
    language = Language[languageString as keyof typeof Language];
  }
  return {
    data: TRANSLATIONS[language],
    userLanguage: language,
  };
}

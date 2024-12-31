import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { Language } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";

const DEFAULT_LANGUAGE = Language.EN;

export async function useTranslations(req: NextRequest) {
  const cookieStore = await cookies();
  let language = DEFAULT_LANGUAGE;
  let languageString =
    cookieStore.get("lang")?.value ||
    req.headers.get("accept-language")?.split(",")[0];
  if (languageString && languageString in Language) {
    language = Language[languageString as keyof typeof Language];
  }
  return {
    data: TRANSLATIONS[language],
    userLanguage: language,
  };
}

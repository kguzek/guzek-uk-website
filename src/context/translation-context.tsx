"use client";

import { Language } from "@/lib/enums";
import { Translation, TRANSLATIONS } from "@/lib/translations";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const TranslationContext = createContext<{
  data: Translation;
  userLanguage: Language;
  setLanguage: (lang: string) => void;
}>({ data: TRANSLATIONS.EN, userLanguage: Language.EN, setLanguage: () => {} });

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [userLanguage, setUserLanguage] = useState<Language>(Language.EN);

  useEffect(() => {
    const prevLang = localStorage.getItem("userLanguage");
    if (!prevLang || prevLang === "undefined") return;
    setLanguage(prevLang);
  }, []);

  function setLanguage(langString: string) {
    if (!(langString in Language)) {
      throw new Error("Invalid language name.");
    }
    const newLang = Language[langString as keyof typeof Language];
    localStorage.setItem("userLanguage", langString);
    setUserLanguage(newLang);
  }

  return (
    <TranslationContext.Provider
      value={{ data: TRANSLATIONS[userLanguage], userLanguage, setLanguage }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslations must be used within a TranslationProvider.",
    );
  }
  return context;
}

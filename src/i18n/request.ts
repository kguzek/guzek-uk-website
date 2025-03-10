import type { Formats } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import type { UserLocale } from "@/lib/types";
import { LONG_DATE_FORMAT, SHORT_DATE_FORMAT, SHORT_TIME_FORMAT } from "@/lib/constants";
import { isValidLocale } from "@/lib/util";

import type { Formatters } from "./types";
import { routing } from "./routing";

export const formats = {
  dateTime: {
    date: LONG_DATE_FORMAT,
    dateShort: SHORT_DATE_FORMAT,
    dateTime: { ...LONG_DATE_FORMAT, ...SHORT_TIME_FORMAT },
    dateTimeShort: { ...SHORT_DATE_FORMAT, ...SHORT_TIME_FORMAT },
  },
} satisfies Formats;

const FORMATTERS: Record<UserLocale, Formatters> = {
  en: {
    quote: (text: string) => `“${text}”`,
    serialiseEpisode: (episode) =>
      `S${episode.season.toString().padStart(2, "0")}E${episode.number
        .toString()
        .padStart(2, "0")}`,
  },
  pl: {
    quote: (text: string) => `„${text}”`,
    serialiseEpisode: (episode) => `S${episode.season}:O${episode.number}`,
  },
};

export function getFormatters(locale: string) {
  if (!isValidLocale(locale)) {
    console.error("Invalid locale:", locale);
    return FORMATTERS[routing.defaultLocale];
  }
  return FORMATTERS[locale];
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!isValidLocale(locale)) {
    locale = routing.defaultLocale;
  }

  const { default: messages } = await import(`../../messages/${locale}.json`);

  return {
    locale,
    messages,
    formats,
  };
});

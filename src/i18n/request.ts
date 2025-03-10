import type { Formats } from "next-intl";
import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import { getRequestConfig } from "next-intl/server";

import type { UserLocale } from "@/lib/types";
import { isValidLocale } from "@/lib/util";

import { routing } from "./routing";

const LONG_DATE_FORMAT = {
  day: "2-digit",
  month: "long",
  year: "numeric",
} as const;

const SHORT_DATE_FORMAT = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
} as const;

const SHORT_TIME_FORMAT = {
  hour: "2-digit",
  minute: "2-digit",
} as const;

export const formats = {
  dateTime: {
    date: LONG_DATE_FORMAT,
    dateShort: SHORT_DATE_FORMAT,
    dateTime: { ...LONG_DATE_FORMAT, ...SHORT_TIME_FORMAT },
    dateTimeShort: { ...SHORT_DATE_FORMAT, ...SHORT_TIME_FORMAT },
  },
} satisfies Formats;

type Formatters = {
  quote: (text: string) => string;
  serialiseEpisode: (episode: Pick<TvMazeEpisode, "season" | "number">) => string;
};

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

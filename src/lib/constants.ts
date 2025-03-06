export const PAGINATED_REGEX_INVALID =
  /^(\/liveseries\/(?:search\/[^\/]+|most-popular))(?:\/[^\/]*[^\/\d].*)?$/;

export const PAGINATED_REGEX = /^(\/liveseries\/(?:search\/[^\/]+|most-popular))\/\d+?$/;

export const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.WEBSITE_URL;
export const PRODUCTION_URL = WEBSITE_URL || "https://www.guzek.uk";

export const LONG_DATE_FORMAT = {
  day: "2-digit",
  month: "long",
  year: "numeric",
} as const;

export const SHORT_DATE_FORMAT = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
} as const;

export const SHORT_TIME_FORMAT = {
  hour: "2-digit",
  minute: "2-digit",
} as const;

// const LONG_TIME_FORMAT = {
//   ...SHORT_TIME_FORMAT,
//   second: "2-digit",
// } as const;

export const LIVESERIES_SERVER_HOMEPAGE =
  "https://github.com/kguzek/guzek-uk-liveseries-server";

export const CAROUSEL_INDICATOR_FULL_WIDTH = 140;

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

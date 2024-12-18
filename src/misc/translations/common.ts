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

export const PAGINATED_REGEX_INVALID =
  /^(\/liveseries\/(?:search\/[^\/]+|most-popular))(?:\/[^\/]*[^\/\d].*)?$/;

export const PAGINATED_REGEX = /^(\/liveseries\/(?:search\/[^\/]+|most-popular))\/\d+?$/;

export const PRODUCTION_URL = process.env.WEBSITE_URL || "https://www.guzek.uk";

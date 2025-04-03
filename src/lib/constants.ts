export const PAGINATED_REGEX_INVALID =
  /^(\/liveseries\/(?:search\/[^\/]+|most-popular))(?:\/[^\/]*[^\/\d].*)?$/;
export const PAGINATED_REGEX = /^(\/liveseries\/(?:search\/[^\/]+|most-popular))\/\d+?$/;

export const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.WEBSITE_URL;
export const PRODUCTION_URL = WEBSITE_URL || "https://www.guzek.uk";
export const GITHUB_URL = "https://github.com/kguzek";
export const LIVESERIES_SERVER_HOMEPAGE = `${GITHUB_URL}/guzek-uk-liveseries-server`;
export const EMAIL_FROM_ADDRESS = "noreply@guzek.uk";
export const EMAIL_FROM_NAME = "Guzek UK";

export const CAROUSEL_INDICATOR_FULL_WIDTH = 140;
export const EMAIL_VERIFICATION_COOKIE = "pending_email_address";
export const EMAIL_VERIFICATION_PARAM = "verify-email-success";

export const OG_IMAGE_METADATA = { width: 1200, height: 630, type: "image/png" };
export const NAV_BAR_HEIGHT_DESKTOP = 100;
export const NAV_BAR_HEIGHT_MOBILE = 80;

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
export const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
export const IP_BLACKLIST = (process.env.IP_BLACKLIST || "").split(";");

export const LOCALES = ["en", "pl"] as const;
export const DEFAULT_LOCALE = "en";
export const PATHS_EXCLUDED_FROM_I18N = ["/admin"];

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
export const S3_SERVER_REGION = process.env.S3_SERVER_REGION || "";
export const S3_SERVER_URL = process.env.S3_SERVER_URL || "";
export const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || "";
export const S3_ACCESS_KEY_SECRET = process.env.S3_ACCESS_KEY_SECRET || "";

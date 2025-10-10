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

/** The duration, in seconds, that new access tokens should be valid for. */
export const ACCESS_TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
/** When an access token reaches this ratio of its lifetime it will be considered 'expiring soon'. */
const ACCESS_TOKEN_EXPIRING_SOON_RATIO = 0.3;
/** Approximately 50 hours. */
export const ACCESS_TOKEN_EXPIRING_SOON_SECONDS =
  ACCESS_TOKEN_EXPIRATION_SECONDS * ACCESS_TOKEN_EXPIRING_SOON_RATIO;

// TODO: is there a provided factory for serialized rich text nodes?
export const DEFAULT_RICH_TEXT_CONTENT = {
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            mode: "normal",
            text: "Hello{USERNAME},",
            type: "text",
            style: "",
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        textStyle: "",
        textFormat: 0,
      },
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            mode: "normal",
            text: "You are receiving this email because ",
            type: "text",
            style: "",
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        textStyle: "",
        textFormat: 0,
      },
    ],
    direction: "ltr",
  },
};

export const EMAIL_TEMPLATE_CONTENT = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{EMAIL_TITLE}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333333;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #2596be;
        text-align: center;
        font-size: 40px;
      }
      .content {
        text-align: start;
        font-size: 20px;
      }
      .button-container {
        text-align: center;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        margin: 20px 0;
        background-color: #2596be;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
      }
      .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 12px;
        color: #666666;
      }
      .footer hr {
        border: none;
        border-top: 1px solid #dddddd;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>{EMAIL_TITLE}</h1>
      <div class="content">
        {EMAIL_PARAGRAPHS}
      </div>
      <div class="footer">
        <hr />
        <p>{CURRENT_YEAR} &copy;&nbsp;<a href="{WEBSITE_URL}">Konrad Guzek</a></p>
      </div>
    </div>
  </body>
</html>`;

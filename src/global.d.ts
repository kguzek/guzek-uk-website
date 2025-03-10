import type { formats } from "@/i18n/request";

import type en from "../messages/en.json";
import type pl from "../messages/pl.json";

declare global {
  type IntlMessages = typeof en & typeof pl;
  type IntlFormats = typeof formats;
}

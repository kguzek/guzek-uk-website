import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";

export function NumericValue({
  value,
  userLanguage,
}: {
  value: number | string;
  userLanguage: Language;
}) {
  const data = TRANSLATIONS[userLanguage];
  return <span className="font-serif">{data.format.number.format(+value)}</span>;
}

import { useTranslations } from "@/context/translation-context";

export function NumericValue({ value }: { value: number | string }) {
  const { data } = useTranslations();
  return <span className="serif">{data.numberFormat.format(+value)}</span>;
}

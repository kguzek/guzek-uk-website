import { useTranslations } from "@/providers/translation-provider";

export async function NumericValue({ value }: { value: number | string }) {
  const { data } = await useTranslations();
  return <span className="serif">{data.numberFormat.format(+value)}</span>;
}

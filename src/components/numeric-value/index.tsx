import { getTranslations } from "@/lib/providers/translation-provider";

export async function NumericValue({ value }: { value: number | string }) {
  const { data } = await getTranslations();
  return <span className="font-serif">{data.format.number.format(+value)}</span>;
}

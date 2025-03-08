import { getFormatter } from "next-intl/server";

export async function NumericValue({ value }: { value: number | string }) {
  const formatter = await getFormatter();
  return <span className="font-serif">{formatter.number(+value)}</span>;
}

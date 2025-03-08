import { useFormatter } from "next-intl";

export function NumericValue({ value }: { value: number | string }) {
  const format = useFormatter();
  return <span className="font-serif">{format.number(+value)}</span>;
}

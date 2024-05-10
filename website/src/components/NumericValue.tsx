import { useContext } from "react";
import { TranslationContext } from "../misc/context";

export function NumericValue({ value }: { value: number | string }) {
  const data = useContext(TranslationContext);
  return <span className="serif">{data.numberFormat.format(+value)}</span>;
}


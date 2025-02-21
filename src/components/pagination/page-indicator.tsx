"use client";

import Link from "next/link";

import type { Language } from "@/lib/enums";
import { getSearchParams } from "@/lib/backend";
import { TRANSLATIONS } from "@/lib/translations";
import { cn } from "@/lib/utils";

/** UNUSED as of 2025-02-21 */

export function PageIndicator({
  page,
  currentPage,
  direction,
  searchParams,
  disabled = false,
  userLanguage,
}: {
  page?: number;
  currentPage: number;
  searchParams: Record<string, string>;
  direction?: "PREVIOUS" | "NEXT";
  disabled?: boolean;
  userLanguage: Language;
}) {
  const loading = [];
  let displayValue;
  const data = TRANSLATIONS[userLanguage];

  if (null == page) {
    if (!direction) return <div className="page-indicator disabled">...</div>;
    [displayValue, page] =
      direction === "PREVIOUS"
        ? ["<", currentPage - 1]
        : [">", currentPage + 1];
  } else {
    displayValue = data.numberFormat.format(page);
  }
  return (
    <Link
      href={
        disabled
          ? "#"
          : getSearchParams({ ...searchParams, page: page.toString() })
      }
      className={cn("page-indicator font-serif", {
        disabled,
        "current-page": page === currentPage && !disabled,
        auxiliary: !!direction,
      })}
      onClick={(evt) => {
        if (loading.length > 0 || disabled) evt.preventDefault();
      }}
    >
      {displayValue}
    </Link>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { LOCALES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LanguageSelector() {
  // const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="my-4 flex flex-col items-center lg:my-0 lg:mr-4">
      <div className="flex gap-1">
        <div
          aria-hidden="true"
          className={cn(
            "bg-accent absolute -z-1 size-8 rounded-md transition-transform duration-300",
            {
              "translate-x-9": locale === "pl",
            },
          )}
        />
        {LOCALES.map((language) => (
          <Link
            aria-selected={locale === language}
            locale={language}
            href={pathname}
            key={language}
            prefetch={false}
            className={cn("w-8 cursor-default py-2 text-center text-xs font-semibold", {
              "clickable cursor-pointer": locale !== language,
            })}
          >
            {language.toUpperCase()}
          </Link>
        ))}
      </div>
      <small className="mt-2 text-xs lg:mt-1">{t("language")}</small>
    </div>
  );
}

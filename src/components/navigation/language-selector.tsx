"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

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
        ></div>
        {LOCALES.map((language) => (
          <Link
            aria-selected={locale === language}
            href={`/${language.toLowerCase()}${pathname}`}
            key={language}
            prefetch={false}
            // onClick={(evt) => {
            //   // Link is being used as a fallback for clients without JavaScript enabled
            //   // If it is enabled, we can handle the language change without a full page reload
            //   evt.preventDefault();
            //   router.refresh();
            // }}
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

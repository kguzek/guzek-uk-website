"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { setLanguageCookie } from "@/lib/util";
import { cn } from "@/lib/utils";

export function LanguageSelector({ userLanguage }: { userLanguage: Language }) {
  const router = useRouter();
  const pathname = usePathname();
  const data = TRANSLATIONS[userLanguage];

  return (
    <div className="my-4 flex flex-col items-center lg:my-0 lg:mr-4">
      <div className="flex gap-1">
        <div
          aria-hidden="true"
          className={cn(
            "bg-accent absolute -z-1 size-8 rounded-md transition-transform duration-300",
            {
              "translate-x-9": userLanguage === Language.PL,
            },
          )}
        ></div>
        {Object.keys(TRANSLATIONS).map((language) => (
          <Link
            aria-selected={userLanguage === language}
            href={`/${language.toLowerCase()}${pathname}`}
            key={language}
            prefetch={false}
            onClick={(evt) => {
              // Link is being used as a fallback for clients without JavaScript enabled
              // If it is enabled, we can handle the language change without a full page reload
              evt.preventDefault();
              setLanguageCookie(language);
              router.refresh();
            }}
            className={cn("w-8 cursor-default py-2 text-center text-xs font-semibold", {
              "clickable cursor-pointer": userLanguage !== language,
            })}
          >
            {language}
          </Link>
        ))}
      </div>
      <small className="mt-2 text-xs lg:mt-1">{data.language}</small>
    </div>
  );
}

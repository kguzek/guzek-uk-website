"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Language } from "@/lib/enums";
import { useLanguageSelector } from "@/context/language-selector-context";
import { cn } from "@/lib/cn";
import { TRANSLATIONS } from "@/lib/translations";
import { setLanguageCookie } from "@/lib/util";

// import { useTranslations } from "@/providers/translation-provider";
// import { InferGetServerSidePropsType } from "next";
// import { NextRequest } from "next/server";

// function getServerSideProps(req: NextRequest) {
//   return {
//     props: useTranslations(req),
//   };
// }

export function LanguageSelector({ userLanguage }: { userLanguage: Language }) {
  /*{
  data,
  userLanguage,
  setLanguage,
}: InferGetServerSidePropsType<typeof getServerSideProps>*/
  const [language, setLanguage] = useState(userLanguage);
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { selectedButtonRef, markerStyle, updateMarkerStyle } =
    useLanguageSelector();
  const data = TRANSLATIONS[language];

  useEffect(() => {
    updateMarkerStyle();
    if (!selectedButtonRef.current) return;
  }, [selectedButtonRef.current, pathname]);

  return (
    <div className="my-4 flex flex-col items-center lg:my-0 lg:mr-4">
      <div className="flex gap-1">
        <div
          className={cn("absolute -z-10 rounded-md bg-accent", {
            "transition-all duration-300": isClicked,
          })}
          style={markerStyle}
        ></div>
        {Object.keys(TRANSLATIONS).map((lang) => (
          <Link
            href={`/${lang.toLowerCase()}${pathname}`}
            key={lang}
            prefetch={false}
            onClick={(evt) => {
              // Link is being used as a fallback for clients without JavaScript enabled
              // If it is enabled, we can handle the language change without a full page reload
              evt.preventDefault();
              setLanguage(lang as Language);
              setLanguageCookie(lang);
              setIsClicked(true);
              setTimeout(() => setIsClicked(false), 300);
              router.refresh();
            }}
            ref={language === lang ? selectedButtonRef : null}
            // I'm using selectedButtonRef.current as a check to see if it's being rendered on the client or server side
            // Since the server side doesn't have a window object, it can't calculate the offset values, so it won't render the marker
            // The same is true for clients without JavaScript enabled, so the marker is applied via CSS instead
            className={cn("w-8 py-2 text-center text-xs font-semibold", {
              "rounded-md bg-accent":
                userLanguage === lang && selectedButtonRef.current == null,
              clickable: userLanguage !== lang,
            })}
          >
            {lang}
          </Link>
        ))}
      </div>
      <small className="mt-2 text-xs lg:mt-1">{data.language}</small>
    </div>
  );
}

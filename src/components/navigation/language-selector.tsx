"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { TRANSLATIONS } from "@/lib/translations";
import { setLanguageCookie } from "@/lib/util";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Language } from "@/lib/enums";
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
  const [markerStyle, setMarkerStyle] = useState<CSSProperties>({});
  const [language, setLanguage] = useState(userLanguage);
  const selectedButtonRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const data = TRANSLATIONS[language];

  function updateMarkerStyle() {
    const button = selectedButtonRef.current;
    setMarkerStyle({
      width: button?.offsetWidth,
      height: button?.offsetHeight,
      left: button?.offsetLeft,
      top: button?.offsetTop,
    });
  }

  useEffect(() => {
    window.addEventListener("resize", updateMarkerStyle);
    window.addEventListener("load", updateMarkerStyle);

    return () => {
      window.removeEventListener("resize", updateMarkerStyle);
      window.removeEventListener("load", updateMarkerStyle);
    };
  }, [selectedButtonRef]);

  useEffect(() => {
    updateMarkerStyle();
    if (!selectedButtonRef.current) return;
  }, [selectedButtonRef.current]);

  return (
    <div className="my-4 flex flex-col items-center lg:my-0 lg:mr-4">
      <div className="flex gap-1">
        <div
          className="absolute -z-10 rounded-md bg-accent transition-all duration-300"
          style={markerStyle}
        ></div>
        {Object.keys(TRANSLATIONS).map((lang) => (
          <Link
            href={`/${lang.toLowerCase()}${pathname}`}
            key={lang}
            onClick={(evt) => {
              // Link is being used as a fallback for clients without JavaScript enabled
              // If it is enabled, we can handle the language change without a full page reload
              evt.preventDefault();
              setLanguage(lang as Language);
              setLanguageCookie(lang);
              router.refresh();
            }}
            ref={language === lang ? selectedButtonRef : null}
            // I'm using selectedButtonRef.current as a check to see if it's being rendered on the client or server side
            // Since the server side doesn't have a window object, it can't calculate the offset values, so it won't render the marker
            // The same is true for clients without JavaScript enabled, so the marker is applied via CSS instead
            className={`${userLanguage === lang ? (selectedButtonRef.current ? "" : "rounded-md bg-accent") : "clickable"} w-8 py-2 text-center text-xs font-semibold`}
          >
            {lang}
          </Link>
        ))}
      </div>
      <small className="mt-2 text-xs lg:mt-1">{data.language}</small>
    </div>
  );
}

"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { TRANSLATIONS } from "@/lib/translations";
import { useTranslations } from "@/context/translation-context";
import { setLanguageCookie } from "@/lib/util";
// import { useTranslations } from "@/providers/translation-provider";
// import { InferGetServerSidePropsType } from "next";
// import { NextRequest } from "next/server";

// function getServerSideProps(req: NextRequest) {
//   return {
//     props: useTranslations(req),
//   };
// }

export function LanguageSelector() {
  /*{
  data,
  userLanguage,
  setLanguage,
}: InferGetServerSidePropsType<typeof getServerSideProps>*/
  const { data, userLanguage, setLanguage } = useTranslations();
  const [markerStyle, setMarkerStyle] = useState<CSSProperties>({});
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

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
  }, [selectedButtonRef.current]);

  return (
    <div className="centred lang-selector">
      <div className="lang-selector-marker" style={markerStyle}></div>
      {Object.keys(TRANSLATIONS).map((lang) => (
        <button
          key={lang}
          onClick={() => {
            setLanguage(lang);
            setLanguageCookie(lang);
          }}
          className={userLanguage === lang ? "" : "clickable"}
          ref={userLanguage === lang ? selectedButtonRef : null}
        >
          {lang}
        </button>
      ))}
      <small>{data.language}</small>
    </div>
  );
}

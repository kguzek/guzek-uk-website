"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { setLanguageCookie } from "@/lib/util";

export function LanguageCookie() {
  useEffect(() => {
    const cookie = Cookies.get("lang");
    if (!cookie) {
      console.debug("No language cookie set. Setting to EN.");
      setLanguageCookie("EN");
    }
  }, []);

  return null;
}

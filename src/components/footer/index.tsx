"use client";

import Logo from "@/media/logo";
import { useTranslations } from "@/context/translation-context";
import "./footer.css";

export function Footer() {
  const { data } = useTranslations();
  return (
    <footer className="centred">
      <hr />
      <Logo size={20} />
      <small>
        <a
          className="hover-underline"
          href="https://github.com/kguzek"
          target="_blank"
        >
          {data.footer(new Date().getFullYear().toString())}
        </a>
      </small>
    </footer>
  );
}

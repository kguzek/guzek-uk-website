"use client";

import { ThreeDots } from "react-loader-spinner";
import { useTranslations } from "@/context/translation-context";
import { COLOR_PRIMARY } from "..";
import "./loading-screen.css";

export async function LoadingScreen({
  text,
  className = "loading-screen",
}: {
  text?: string;
  className?: string;
}) {
  const { data } = useTranslations();
  return (
    <div className={className}>
      <h2 className="loading-text">{text ?? data.loading}</h2>
      <ThreeDots height={15} color={COLOR_PRIMARY} />
    </div>
  );
}

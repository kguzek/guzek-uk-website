import React from "react";
import { ThreeDots } from "react-loader-spinner";
import "./LoadingScreen.css";

const COLOR_PRIMARY = "var(--color-primary)";

export default function LoadingScreen({
  text,
  className = "loading-screen",
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="loading-text">{text}</h2>
      <ThreeDots height={15} color={COLOR_PRIMARY} />
    </div>
  );
}

export function LoadingButton() {
  return (
    <div className={"flex-column"}>
      <ThreeDots color={COLOR_PRIMARY} />
    </div>
  );
}

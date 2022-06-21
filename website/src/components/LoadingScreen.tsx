import React from "react";
import { ThreeDots } from "react-loader-spinner";
import "../styles/loadingScreen.css";

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
      <ThreeDots height={15} />
    </div>
  );
}

export function LoadingButton({
  className,
  color,
}: {
  className: string;
  color?: string;
}) {
  return (
    <div className={className}>
      <ThreeDots color={color} />
    </div>
  );
}

import React from "react";
import { ThreeDots } from "react-loader-spinner";
import "../styles/loadingScreen.css";

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <h2 className="loading-text">Loading Guzek UK</h2>
      <ThreeDots height={15} />
    </div>
  );
}

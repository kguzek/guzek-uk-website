import React from "react";
import { ThreeDots } from "react-loader-spinner";

export default function LoadingScreen({}) {
  return (
    <div className="centred" style={{ marginTop: "35vh" }}>
      <h2>Loading Guzek UK...</h2>
			<ThreeDots />
    </div>
  );
}

import React from "react";
import { Translation } from "../misc/translations";

export default function LiveSeries({ data }: { data: Translation }) {
  return (
    <div className="text">
      <h2>{data.liveSeries.title}</h2>
      This page is WIP
    </div>
  );
}


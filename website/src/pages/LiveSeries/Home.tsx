import React, { useEffect } from "react";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle } from "./Base";

export default function Home({ data }: { data: Translation }) {
  const title = getLiveSeriesTitle(data, "home");

  useEffect(() => {
    setTitle(title);
  }, [data]);

  return (
    <>
      <h2>{title}</h2>
    </>
  );
}


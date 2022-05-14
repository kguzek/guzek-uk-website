import React, { useEffect } from "react";
import { Translation } from "../translations";

function Konrad({ data }: { data: Translation }) {
  useEffect(() => {
    document.title = data.title;
  }, [data]);

  return (
    <div className="text">
      <p>{data.bodyKonrad}</p>
    </div>
  );
}

export default Konrad;

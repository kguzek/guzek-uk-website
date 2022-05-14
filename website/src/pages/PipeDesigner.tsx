import React, { useEffect } from "react";
import { Translation } from "../translations";

export default function PipeDesigner({
  data,
}: {
  data: Translation;
}) {
  useEffect(() => {
    document.title = data.titlePipeDesigner + " | " + data.title;
  }, [data]);

  useEffect(() => {
    window.location.href = "https://www.guzek.uk/pipe-designer/";
  }, []);

  return (
    <div className="text">
      <p>{data.bodyPipeDesigner}</p>
    </div>
  );
}

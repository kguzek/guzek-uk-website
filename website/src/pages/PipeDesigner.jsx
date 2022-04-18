import React, { useEffect } from "react";

export default function PipeDesigner({ data }) {
  useEffect(() => {
    document.title = data.titlePipeDesigner + " | " + data.title;
  }, [data]);

  useEffect(() => {
    window.location = "https://www.guzek.uk/pipe-designer/";
  }, []);

  return (
    <div className="text">
      <p>{data.bodyPipeDesigner}</p>
    </div>
  );
}

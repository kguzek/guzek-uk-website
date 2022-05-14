import React, { useEffect } from "react";
import { Translation } from "../translations";

function NotFound({ data }: { data: Translation }) {
  useEffect(() => {
    document.title = data.title404;
  }, [data]);

  return (
    <div className="text">
      <p>{data.body404}</p>
    </div>
  );
}

export default NotFound;

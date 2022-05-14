import React, { useEffect } from "react";
import { Translation } from "../translations";

function Home({ data }: { data: Translation }) {
  useEffect(() => {
    document.title = data.title;
  }, [data]);

  return (
    <div className="text">
      <p>{data.bodyHome}</p>
    </div>
  );
}

export default Home;

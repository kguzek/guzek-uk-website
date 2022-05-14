import React, { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { Translation } from "../translations";

export default function PipeDesigner({ data }: { data: Translation }) {
  const [attemptedRefresh, setAttemptedRefresh] = useState(false);

  useEffect(() => {
    document.title = data.titlePipeDesigner + " | " + data.title;
  }, [data]);

  useEffect(() => {
    const lastRedirectTime = localStorage.getItem("lastReloadTime");
    const now = new Date();
    if (lastRedirectTime) {
      const time = new Date(lastRedirectTime);
      if (time.getTime() >= now.getTime() - 5000) {
        setAttemptedRefresh(true);
        return;
      }
    }
    localStorage.setItem("lastReloadTime", now.toISOString());
    window.location.reload();
  }, []);

  if (attemptedRefresh) {
    return (
      <div className="text">
        <p>{data.bodyPipeDesigner}</p>
      </div>
    );
  }
  return <LoadingScreen />;
}

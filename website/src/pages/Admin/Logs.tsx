import React, { useEffect, useState } from "react";
import { useFetchContext } from "../../misc/context";

interface Log {
  timestamp: string;
  level: string;
  message: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<Log[] | null>(null);
  const { tryFetch } = useFetchContext();

  useEffect(() => {
    if (logs) return;

    fetchLogs();
  }, []);

  async function fetchLogs() {
    const res = await tryFetch("logs", {}, [] as Log[]);
    setLogs(res);
  }

  return <div>Logs</div>;
}


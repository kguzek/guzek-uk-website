import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import type { LegacyLogEntry, LogEntry, LogResponse } from "@/lib/types";
import { ErrorComponent } from "@/components/error/component";
import { serverToApi } from "@/lib/backend/server";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";
import { TRANSLATIONS } from "@/lib/translations";
import { getTitle, getUTCDateString } from "@/lib/util";

import { FilteredLogs } from "./filtered-logs";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.admin.logs.title),
  };
}

// Converts local date format to YYYY-MM-DD
const getTodayString = () =>
  TRANSLATIONS.EN.format.dateShort.format(new Date()).split("/").reverse().join("-");

const isLegacyLog = (log: LegacyLogEntry | LogEntry): log is LegacyLogEntry =>
  (log as LegacyLogEntry).label != null;

const convertLegacyLogs = (data: LogResponse) =>
  data.logs.map((log) => {
    if (!isLegacyLog(log)) return log;
    const filename = log.label || "(no filename)";
    if (!log.label) {
      console.warn("Log has no filename label:", log);
    }
    const message =
      typeof log.message === "string" ? log.message : "[See log body for error details]";
    return {
      message,
      level: log.level,
      metadata: { ...log.metadata, filename },
      timestamp: log.timestamp,
    } as LogEntry;
  });

export default async function Logs({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const { data, userLanguage } = await getTranslations();

  const { date } = await searchParams;
  const [dateLogsResult, errorLogsResult] = await Promise.all([
    serverToApi<LogResponse>(
      `logs/date/${date ? getUTCDateString(date) : getTodayString()}`,
    ),
    serverToApi<LogResponse>("logs/error"),
  ]);

  if (!dateLogsResult.ok || !errorLogsResult.ok) {
    console.error("Logs fetch failed:", dateLogsResult, errorLogsResult);
    return <ErrorComponent errorCode={ErrorCode.Forbidden} />;
  }

  const logDate = new Date(dateLogsResult.data.date);
  const previousDate = new Date(logDate.getTime() - 86400000);
  const nextDate = new Date(logDate.getTime() + 86400000);

  const dateLogs = convertLegacyLogs(dateLogsResult.data);
  const errorLogs = convertLegacyLogs(errorLogsResult.data);

  const errorLogsFiltered = errorLogs.filter(
    (log) => getUTCDateString(log.timestamp) === dateLogsResult.data.date,
  );
  const logsSorted = [...dateLogs, ...errorLogsFiltered].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <div>
      <div className="relative mb-4 flex w-full">
        <h3 className="absolute text-2xl font-bold">{data.admin.logs.title}</h3>
        <div className="mx-auto mt-0 flex gap-3">
          <Link
            href={`/admin-legacy/logs?date=${getUTCDateString(previousDate)}`}
            className="clickable"
          >
            <ArrowLeftIcon />
          </Link>
          <Link href={`/admin-legacy/logs`} className="clickable">
            {logDate.toLocaleDateString()}
          </Link>
          <Link
            href={`/admin-legacy/logs?date=${getUTCDateString(nextDate)}`}
            className="clickable"
          >
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
      <div className="logs flex-column">
        <FilteredLogs logs={logsSorted} userLanguage={userLanguage} />
      </div>
    </div>
  );
}

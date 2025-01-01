import type { Metadata } from "next";
import Link from "next/link";
import { ErrorComponent } from "@/components/error-component";
import type { LogResponse } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";
import { getTitle, getUTCDateString } from "@/lib/util";
import { ErrorCode } from "@/lib/enums";
import { serverToApi } from "@/lib/backend-v2";
import { useTranslations } from "@/providers/translation-provider";
import { FilteredLogs } from "./filtered-logs";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await useTranslations();
  return {
    title: getTitle(data.admin.logs.title),
  };
}

// Converts local date format to YYYY-MM-DD
const getTodayString = () =>
  TRANSLATIONS.EN.dateShortFormat
    .format(new Date())
    .split("/")
    .reverse()
    .join("-");

export default async function Logs({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const { data, userLanguage } = await useTranslations();

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

  return (
    <div>
      <div
        className="flex"
        style={{
          marginBottom: "15px",
          width: "100%",
          position: "relative",
        }}
      >
        <h3 className="absolute text-2xl font-bold">{data.admin.logs.title}</h3>
        <div
          className="flex gap-10"
          style={{
            margin: "0 auto",
          }}
        >
          <Link
            href={`/admin/logs?date=${getUTCDateString(previousDate)}`}
            className="clickable"
          >
            <i className="fa fa-arrow-left"></i>
          </Link>
          <Link href={`/admin/logs`} className="clickable">
            {logDate.toLocaleDateString()}
          </Link>
          <Link
            href={`/admin/logs?date=${getUTCDateString(nextDate)}`}
            className="clickable"
          >
            <i className="fa fa-arrow-right"></i>
          </Link>
        </div>
      </div>
      <div className="logs flex-column">
        <FilteredLogs
          dateLogs={dateLogsResult.data}
          errorLogs={errorLogsResult.data}
          userLanguage={userLanguage}
        />
      </div>
    </div>
  );
}

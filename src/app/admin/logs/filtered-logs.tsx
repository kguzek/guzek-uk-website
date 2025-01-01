"use client";

import InputBox from "@/components/forms/input-box";
import { NumericValue } from "@/components/numeric-value/client";
import { SyntaxHighlighted } from "@/components/syntax-highlighted";
import { Language, LOG_LEVEL_ICONS } from "@/lib/enums";
import { LogEntry, LogLevel, LogResponse, StateSetter } from "@/lib/types";
import { getUTCDateString, scrollToElement } from "@/lib/util";
import { useEffect, useState } from "react";

const IP_LOOKUP_URL = "https://www.ip-tracker.org/locator/ip-lookup.php?ip=";

const getIcon = (key: string) =>
  LOG_LEVEL_ICONS[key as LogLevel] || "question error";

const entryHasBody = (entry: LogEntry) =>
  entry.metadata?.body && Object.keys(entry.metadata.body).length > 0;

type Filter = {
  ascending: boolean;
  levels: LogLevel[];
  labels: string[];
  withBodyOnly: boolean;
};

export function FilteredLogs({
  dateLogs,
  errorLogs,
  userLanguage,
}: {
  dateLogs: LogResponse;
  errorLogs: LogResponse;
  userLanguage: Language;
}) {
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>({
    ascending: false,
    levels: Object.keys(LOG_LEVEL_ICONS) as LogLevel[],
    labels: [],
    withBodyOnly: false,
  });

  useEffect(() => {
    const foundLabels = new Set<string>();
    for (const log of [...errorLogs.logs, ...dateLogs.logs]) {
      if (!log.label) continue;
      foundLabels.add(log.label);
    }
    setLabels([...foundLabels]);

    const errorLogsFiltered = errorLogs.logs.filter(
      (log) => getUTCDateString(log.timestamp) === dateLogs.date,
    );

    const logsSorted = [...dateLogs.logs, ...errorLogsFiltered].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    const baseLogFilter = (log: LogEntry) =>
      filter.levels.includes(log.level) &&
      (!filter.withBodyOnly || entryHasBody(log));

    const predicate =
      filter.labels.length === 0
        ? baseLogFilter
        : (log: LogEntry) =>
            baseLogFilter(log) && filter.labels.includes(log.label);

    const logsFiltered = logsSorted.filter(predicate);
    if (!filter.ascending) {
      logsFiltered.reverse();
    }
    setFilteredLogs(logsFiltered);
    scrollToElement("#logs-header");
  }, [dateLogs, errorLogs, filter]);

  return (
    <div className="cards flex-column stretch gap-10">
      <div className="flex gap-10">
        <h4>Log levels:</h4>
        {Object.entries(LOG_LEVEL_ICONS).map(([key, icon], idx) => {
          const level = key as LogLevel;
          const selected = filter.levels.includes(level);
          return (
            <div key={`level-selector-${idx}`} className={level}>
              <div
                className="clickable level-icon"
                onClick={() =>
                  setFilter((old) => ({
                    ...old,
                    levels: selected
                      ? old.levels.filter((val) => val !== level)
                      : [...old.levels, level],
                  }))
                }
              >
                <i
                  className={`fa-solid fa-${icon} ${
                    selected ? "" : "deselected"
                  }`}
                  title={level}
                ></i>
              </div>
            </div>
          );
        })}
      </div>
      <div className="stretch flex gap-10">
        <h4 className="nowrap">Source files:</h4>
        <div className="flex flex-wrap">
          {labels.map((label, idx) => {
            const selected = filter.labels.includes(label);
            return (
              <div
                key={`label-selector-${idx}`}
                className={`clickable log-label ${
                  selected ? "" : "deselected"
                }`}
                onClick={() =>
                  setFilter((old) => ({
                    ...old,
                    labels: selected
                      ? old.labels.filter((val) => val !== label)
                      : [...old.labels, label],
                  }))
                }
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex">
        <InputBox
          label={"With body only:"}
          type="checkbox"
          value={filter.withBodyOnly}
          setValue={(withBodyOnly: boolean) =>
            setFilter((old) => ({ ...old, withBodyOnly }))
          }
        />
      </div>
      <div className="flex gap-10">
        <div
          className="clickable flex gap-10"
          onClick={() =>
            setFilter((old) => ({ ...old, ascending: !old.ascending }))
          }
        >
          <h4>Sort:</h4>
          <div>
            <i
              className={`fa-solid fa-arrow-${
                filter.ascending ? "up" : "down"
              }`}
            ></i>
          </div>
        </div>
      </div>
      <h3 id="logs-header">
        Number of log entries:{" "}
        <NumericValue value={filteredLogs.length} userLanguage={userLanguage} />
      </h3>
      {filteredLogs.map((log, idx) => (
        <Log key={idx} data={log} setFilter={setFilter} />
      ))}
    </div>
  );
}

function Log({
  data,
  setFilter,
}: {
  data: LogEntry;
  setFilter: StateSetter<Filter>;
}) {
  const [collapsed, setCollapsed] = useState(true);

  let message = data.message;
  if (typeof message !== "string" && data.level === "error") {
    message = "[See log body for error details]";
    data.metadata.body = data.message;
  }
  const showBody = entryHasBody(data);

  return (
    <div className="flex-column stretch">
      <div className={`card-container log ${data.level}`}>
        <div className="card flex gap-10">
          <div
            className="clickable centred level-icon"
            title={data.level}
            onClick={() =>
              setFilter((old) => ({ ...old, levels: [data.level] }))
            }
          >
            <i className={`fa-solid fa-${getIcon(data.level)}`}></i>
          </div>
          <div className="log-body flex-column flex gap-10">
            <div className="log-header flex">
              <small>
                <code className="flex gap-10">
                  {data.timestamp}
                  {data.metadata?.ip && (
                    <span>
                      (
                      <a
                        href={IP_LOOKUP_URL + data.metadata.ip}
                        target="_blank"
                        className="clickable hover-underline"
                      >
                        {data.metadata.ip}
                      </a>
                      )
                    </span>
                  )}
                </code>
              </small>
              <div
                className="clickable log-label"
                onClick={() =>
                  setFilter((old) => ({ ...old, labels: [data.label] }))
                }
              >
                {data.label}
              </div>
            </div>
            <div className="flex flex-wrap gap-10">
              {showBody && (
                <div
                  className="clickable"
                  onClick={() => setCollapsed((old) => !old)}
                >
                  <div
                    className="message flex"
                    title={
                      (collapsed ? "Expand" : "Collapse") + " log entry body"
                    }
                  >
                    <i className="fas fa-code"></i>
                    <i
                      className={`fas fa-caret-up transition-transform ${
                        collapsed ? "rotate-180" : ""
                      }`}
                    ></i>
                  </div>
                </div>
              )}
              <code className="message">{message.toString()}</code>
            </div>
          </div>
        </div>
      </div>
      {showBody && (
        <div
          className={`log-container collapsible ${collapsed ? "hidden" : ""}`}
        >
          <div className="no-overflow flex">
            <SyntaxHighlighted json={data.metadata.body} />
          </div>
        </div>
      )}
    </div>
  );
}

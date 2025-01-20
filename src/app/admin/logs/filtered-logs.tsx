"use client";

import { useEffect, useState } from "react";
import type { ComponentProps, ElementType, ReactNode } from "react";
import InputBox from "@/components/forms/input-box";
import { NumericValue } from "@/components/numeric-value/client";
import { SyntaxHighlighted } from "@/components/syntax-highlighted";
import type { Language } from "@/lib/enums";
import { LOG_LEVELS } from "@/lib/enums";
import type { LogEntry, LogLevel, StateSetter } from "@/lib/types";
import { scrollToElement } from "@/lib/util";
import { cn } from "@/lib/utils";

const IP_LOOKUP_URL = "https://www.ip-tracker.org/locator/ip-lookup.php?ip=";

function parseLogEntry(log: LogEntry) {
  const { filename, ip, ...meta } = log.metadata;
  // Flatten the metadata if it contains a key called 'body' (i.e. request body)
  const body = meta.body ?? meta;
  return {
    filename,
    ip,
    body,
    hasBody: Object.keys(body).length > 0,
  };
}

type Filter = {
  ascending: boolean;
  levels: readonly LogLevel[];
  labels: string[];
  withBodyOnly: boolean;
};

function LogLevelIcon({
  level,
  selected = true,
}: {
  level: LogLevel;
  selected?: boolean;
}) {
  return (
    <i
      title={[level[0].toUpperCase(), level.slice(1)].join("")}
      className={cn("clickable fa fa-solid min-w-8 text-center text-2xl", {
        "fa-warning text-error": level === "crit",
        "fa-exclamation-circle text-error": level === "error",
        "fa-warning text-accent2": level === "warn",
        "fa-info-circle text-success": level === "info",
        "fa-download text-fuchsia-400": level === "request",
        "fa-upload text-violet-500": level === "response",
        "fa-globe text-orange-400": level === "http",
        "fa-bug text-accent": level === "debug",
        "fa-info-circle text-primary": level === "verbose",
        "text-background-soft": !selected,
      })}
    ></i>
  );
}

function StyledLogComponent<T extends ElementType>({
  log,
  tag,
  children,
  ...props
}: Omit<ComponentProps<T>, "tag" | "log" | "children"> & {
  log: LogEntry;
  tag: T;
  children: ReactNode;
}) {
  const Tag = tag as ElementType;

  return (
    <Tag
      {...props}
      className={cn(
        "whitespace-pre-wrap break-all rounded-3xl bg-primary px-4 py-3 text-background",
        {
          "text-error": log.level === "crit",
          "bg-background text-error": log.level === "error",
          "bg-background text-accent2": log.level === "warn",
          "text-background-soft": log.level === "verbose",
        },
        props.className,
      )}
    >
      {children}
    </Tag>
  );
}

export function FilteredLogs({
  logs,
  userLanguage,
}: {
  logs: LogEntry[];
  userLanguage: Language;
}) {
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>({
    ascending: false,
    levels: LOG_LEVELS,
    labels: [],
    withBodyOnly: false,
  });

  useEffect(() => {
    const foundLabels = new Set<string>();
    for (const log of logs) {
      if (!log.metadata.filename) continue;
      foundLabels.add(log.metadata.filename);
    }
    setLabels([...foundLabels]);

    const baseLogFilter = (log: LogEntry) =>
      filter.levels.includes(log.level) &&
      (!filter.withBodyOnly || parseLogEntry(log).hasBody);

    const predicate =
      filter.labels.length === 0
        ? baseLogFilter
        : (log: LogEntry) =>
            baseLogFilter(log) && filter.labels.includes(log.metadata.filename);

    const logsFiltered = logs.filter(predicate);
    if (!filter.ascending) {
      logsFiltered.reverse();
    }
    setFilteredLogs(logsFiltered);
    scrollToElement("#logs-header");
  }, [logs, filter]);

  return (
    <div className="cards flex-column stretch gap-3">
      <div className="flex items-center gap-3">
        <h4>Log levels:</h4>
        {LOG_LEVELS.map((level, idx) => {
          const selected = filter.levels.includes(level);
          return (
            <div key={`level-selector-${idx}`} className={level}>
              <div
                onClick={() =>
                  setFilter((old) => ({
                    ...old,
                    levels: selected
                      ? old.levels.filter((val) => val !== level)
                      : [...old.levels, level],
                  }))
                }
              >
                <LogLevelIcon level={level} selected={selected} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="stretch flex gap-3">
        <h4 className="whitespace-nowrap">Source files:</h4>
        <div className="flex flex-wrap items-center gap-2">
          {labels.map((label, idx) => {
            const selected = filter.labels.includes(label);
            return (
              <div
                key={`label-selector-${idx}`}
                className={cn("clickable rounded-xl px-3", {
                  "bg-accent text-primary-strong": selected,
                  "bg-background-soft text-primary": !selected,
                })}
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
      <div className="flex gap-3">
        <div
          className="clickable flex items-center gap-3"
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
        <Log key={idx} log={log} setFilter={setFilter} />
      ))}
    </div>
  );
}

function Log({
  log,
  setFilter,
}: {
  log: LogEntry;
  setFilter: StateSetter<Filter>;
}) {
  const [collapsed, setCollapsed] = useState(true);

  let message = log.message;
  const entry = parseLogEntry(log);

  return (
    <div>
      <div className="flex flex-col gap-1 rounded-2xl bg-background-soft px-6 py-4 text-primary-strong">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-3">
            <div
              title={log.level}
              onClick={() =>
                setFilter((old) => ({ ...old, levels: [log.level] }))
              }
            >
              <LogLevelIcon level={log.level} />
            </div>
            <small>
              <code className="flex gap-3">
                {log.timestamp}
                {entry.ip && (
                  <span>
                    (
                    <a
                      href={IP_LOOKUP_URL + entry.ip}
                      target="_blank"
                      className="clickable hover-underline"
                    >
                      {entry.ip}
                    </a>
                    )
                  </span>
                )}
              </code>
            </small>
          </div>
          <div
            className="clickable rounded-xl bg-accent px-3"
            onClick={() =>
              setFilter((old) => ({
                ...old,
                labels: [entry.filename],
              }))
            }
          >
            {entry.filename}
          </div>
        </div>
        <div className="flex flex-wrap items-stretch gap-2">
          {entry.hasBody && (
            <div
              className="clickable"
              onClick={() => setCollapsed((old) => !old)}
            >
              <StyledLogComponent
                tag="div"
                log={log}
                title={(collapsed ? "Expand" : "Collapse") + " log entry body"}
              >
                <i className="fas fa-code mr-3"></i>
                <i
                  className={`fas fa-caret-up transition-transform ${
                    collapsed ? "rotate-180" : ""
                  }`}
                ></i>
              </StyledLogComponent>
            </div>
          )}
          <StyledLogComponent tag="code" log={log}>
            {message}
          </StyledLogComponent>
        </div>
      </div>
      {entry.hasBody && (
        <div
          className={`log-container collapsible ${collapsed ? "collapsed" : "expanded"}`}
        >
          <div className="no-overflow flex">
            <SyntaxHighlighted json={entry.body} />
          </div>
        </div>
      )}
    </div>
  );
}
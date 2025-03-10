"use client";

import { Fragment } from "react";
import { ChevronDown } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { PAGINATED_REGEX } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

const capitalize = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => (part[0].toUpperCase() + part.slice(1)).replace("Tv", "TV"))
    .join(" ")
    .replace("Liveseries", "LiveSeries");

export type Parallel = { label: string; slug: string };
export type Parallels = (null | Parallel[] | Record<string, Parallel[]>)[];

const NON_STANDALONE_PARTS = ["tv-show"];

const isInvalidPart = (part: string) => NON_STANDALONE_PARTS.includes(part);

export function Breadcrumbs({ parallels }: { parallels: Parallels }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  const parts = pathname.split("/");
  if (PAGINATED_REGEX.test(pathname)) {
    parts.pop();
  }
  let ellipsisShown = false;
  return (
    <Breadcrumb className="text mt-6 mb-4">
      <BreadcrumbList className="text-lg">
        {parts.map((part, idx) => {
          const omitting = parts.length > 3 && idx !== 0 && idx !== parts.length - 1;
          const showSeparator = idx !== 0 || omitting;
          if (omitting) {
            if (ellipsisShown) return null;
            ellipsisShown = true;
          }
          return (
            <Fragment key={idx}>
              {showSeparator && <BreadcrumbSeparator />}
              {omitting ? (
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <BreadcrumbEllipsis />
                      <ChevronDown className="size-4 sm:size-min" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {parts.slice(1, idx - 2).map((part, partIdx) => {
                        if (isInvalidPart(part)) return null;
                        return (
                          <DropdownMenuItem key={partIdx}>
                            <Link
                              className="w-full"
                              href={`${parts.slice(0, partIdx + 2).join("/")}`}
                            >
                              {capitalize(decodeURIComponent(part))}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbSegment
                  parallels={parallels}
                  idx={idx}
                  part={part}
                  parts={parts}
                />
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function getPartLabel(partEncoded: string, currentParallels: Parallel[] | null) {
  if (!partEncoded) return "Home";
  const part = decodeURIComponent(partEncoded);

  if (currentParallels == null) return capitalize(part);
  const parallel = currentParallels.find((item) => item.slug === part);
  return parallel == null ? capitalize(part) : parallel.label;
}

const getParallelsAt = (parallels: Parallels, parts: string[], idx: number) =>
  parallels[idx] == null
    ? null
    : Array.isArray(parallels[idx])
      ? parallels[idx]
      : parallels[idx][parts[idx - 1]];

function BreadcrumbSegment({
  parallels,
  idx,
  part,
  parts,
}: {
  parallels: Parallels;
  idx: number;
  part: string;
  parts: string[];
}) {
  const currentParallels = getParallelsAt(parallels, parts, idx);
  const label = getPartLabel(part, currentParallels);
  const numParts = parts.length - 1;
  const className = {
    "text-primary": idx < numParts,
    underlined: idx === numParts,
  };
  return (
    <BreadcrumbItem className="text-xs sm:text-base">
      {currentParallels ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="group flex items-center gap-1 outline-hidden">
            <div
              className={cn(
                "hover-underline group-hover:underlined text-primary-strong",
                className,
              )}
            >
              {label}
            </div>
            <ChevronDown className="size-4 sm:size-min" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {currentParallels
              .filter((item) => item.slug !== part || part !== "tv-show")
              .map((item, parallelIdx) => (
                <DropdownMenuItem asChild key={parallelIdx} className="cursor-pointer">
                  <Link href={`${parts.slice(0, idx).join("/")}/${item.slug}`}>
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <BreadcrumbLink className={cn(className)} asChild>
          <Link
            className="text-primary! hover-underline"
            href={parts.slice(0, idx + 1).join("/") || "/"}
          >
            {label}
          </Link>
        </BreadcrumbLink>
      )}
    </BreadcrumbItem>
  );
}

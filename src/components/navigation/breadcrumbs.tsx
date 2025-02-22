"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Breadcrumb,
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
    .map((part) => (part[0].toUpperCase() + part.slice(1)).replace("Tv", "TV"))
    .join(" ")
    .replace("Liveseries", "LiveSeries");

export type Parallel = { label: string; slug: string };
export type Parallels = (null | Parallel[] | Record<string, Parallel[]>)[];

export function Breadcrumbs({ parallels }: { parallels: Parallels }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  const parts = pathname.split("/");
  return (
    <Breadcrumb className="text mt-6 mb-4">
      <BreadcrumbList className="text-lg">
        {parts.map((part, idx) => (
          <BreadcrumbSegment
            key={idx}
            parallels={parallels}
            idx={idx}
            part={part}
            parts={parts}
          />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
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
  function localisePart(part: string) {
    if (currentParallels == null) return capitalize(part);
    const parallel = currentParallels.find((item) => item.slug === part);
    return parallel == null ? capitalize(part) : parallel.label;
  }
  const capitalized = part ? localisePart(part) : "Home";
  const numParts = parts.length - 1;
  const className = {
    "text-primary": idx < numParts,
    underlined: idx === numParts,
  };
  return (
    <Fragment key={idx}>
      {idx !== 0 && <BreadcrumbSeparator />}
      <BreadcrumbItem>
        {currentParallels ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex items-center gap-1 outline-hidden">
              <div
                className={cn(
                  "hover-underline group-hover:underlined text-primary-strong",
                  className,
                )}
              >
                {capitalized}
              </div>
              <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {currentParallels
                .filter((item) => item.slug !== part || part !== "tv-show")
                .map((item, parallelIdx) => (
                  <DropdownMenuItem
                    asChild
                    key={parallelIdx}
                    className="cursor-pointer"
                  >
                    <Link
                      href={`${parts.slice(0, idx).join("/")}/${item.slug}`}
                    >
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
              {capitalized}
            </Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    </Fragment>
  );
}

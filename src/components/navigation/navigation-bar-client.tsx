"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";

import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/cn";
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

export function NavBarItem({ item }: { item: MenuItem }) {
  const pathname = usePathname();

  // Handle edge case for index page ("/")
  const isActive =
    item.url === "/" ? pathname === "/" : pathname?.startsWith(item.url);
  return (
    <Link
      href={item.url}
      className={cn("hover-underline text-primary", {
        "hover-underlined text-primary-strong": isActive,
      })}
    >
      {item.label || item.title}
    </Link>
  );
}

export function MiniNavBar({
  pathBase,
  pages,
}: {
  pathBase: string;
  pages: {
    link: string;
    label: string;
  }[];
}) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    path
      ? pathname.startsWith(`/${pathBase}/${path}`)
      : [`/${pathBase}`, `/${pathBase}/`].includes(pathname);

  return (
    <nav className="mt-2 flex justify-center gap-2 font-serif text-sm sm:text-base md:gap-4 md:text-lg lg:justify-start">
      {pages.map(({ link, label }, idx) => (
        <Link
          key={idx}
          className={cn("clickable hover-underline font-sans text-primary", {
            "hover-underlined text-primary-strong": isActive(link),
          })}
          href={`/${pathBase}/${link}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

const capitalize = (value: string) =>
  value
    .split("-")
    .map((part) => (part[0].toUpperCase() + part.slice(1)).replace("Tv", "TV"))
    .join(" ")
    .replace("Liveseries", "LiveSeries");

export type Parallel = { label: string; path: string };
export type Parallels = (null | Parallel[] | Record<string, Parallel[]>)[];

export function Breadcrumbs({ parallels }: { parallels: Parallels }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  const parts = pathname.split("/");
  return (
    <Breadcrumb className="text mb-4 mt-6">
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
  console.log(part, parallels[idx]);
  const currentParallels = parallels[idx]
    ? Array.isArray(parallels[idx])
      ? parallels[idx]
      : parallels[idx][parts[1]]
    : null;
  const capitalized = part ? capitalize(part) : "Home";
  const numParts = parts.length - 1;
  const className = {
    "text-primary": idx < numParts,
    "hover-underlined": idx === numParts,
  };
  return (
    <Fragment key={idx}>
      {idx !== 0 && <BreadcrumbSeparator />}
      <BreadcrumbItem>
        {currentParallels ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex items-center gap-1 outline-none">
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
                .filter((item) => item.path !== part || part !== "tv-show")
                .map((item, parallelIdx) => (
                  <DropdownMenuItem
                    asChild
                    key={parallelIdx}
                    className="cursor-pointer"
                  >
                    <Link
                      href={`${parts.slice(0, idx).join("/")}/${item.path}`}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <BreadcrumbLink
            className={cn("hover-underline !text-primary", className)}
            asChild
          >
            <Link href={`/${parts.slice(0, idx + 1).join("/")}`}>
              {capitalized}
            </Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    </Fragment>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

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
      {item.title}
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

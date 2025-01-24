"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem } from "@/lib/types";
import "./navigation.css";

export function NavBarItem({ item }: { item: MenuItem }) {
  const pathname = usePathname();

  // Handle edge case for index page ("/")
  const isActive =
    item.url === "/" ? pathname === "/" : pathname?.startsWith(item.url);
  const className = "clickable nav-link" + (isActive ? " active" : "");
  const A = item.localUrl ? Link : "a";
  return (
    <A href={item.url} className={className}>
      {item.title}
    </A>
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

  const getClassName = (path: string) =>
    (
      path
        ? pathname.startsWith(`/${pathBase}/${path}`)
        : [`/${pathBase}`, `/${pathBase}/`].includes(pathname)
    )
      ? " active"
      : "";

  return (
    <nav className="serif mt-2 flex justify-center gap-2 text-sm sm:text-base md:gap-4 md:text-lg lg:justify-start">
      {pages.map(({ link, label }, idx) => (
        <Link
          key={idx}
          className={`clickable nav-link ${getClassName(link)}`}
          href={`/${pathBase}/${link}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Language } from "@/lib/enums";
import type { MenuItem, User } from "@/lib/types";
import { useScroll } from "@/lib/hooks/scroll";
import { PAGE_NAME } from "@/lib/util";
import { cn } from "@/lib/utils";

import { Logo } from "../logo";
import { LanguageSelector } from "./language-selector";
import { UserWidget } from "./user-widget";

export function NavigationBar({
  user,
  userLanguage,
  children,
}: {
  user: User | null;
  userLanguage: Language;
  children: ReactNode;
}) {
  const { scrollY } = useScroll();
  return (
    <nav
      className={cn(
        "bg-background-strong/50 fixed top-0 flex h-(--navbar-height) w-screen items-center gap-4 border-0 border-b border-solid border-transparent px-4 py-2 backdrop-blur-lg transition-colors duration-1000 sm:h-(--navbar-height-sm) sm:px-10 lg:gap-6",
        { "border-primary": scrollY > 0 },
      )}
    >
      <Logo size={80} />
      <p className="font-bold whitespace-nowrap sm:text-3xl">{PAGE_NAME}</p>
      <div className="ml-auto flex flex-row-reverse lg:flex-row">
        {/* Hamburger */}
        <label
          aria-controls="menu"
          className="peer z-30 flex cursor-pointer flex-col justify-center p-4 lg:hidden"
        >
          <input
            type="checkbox"
            aria-controls="menu"
            id="hamburger"
            className="peer hidden"
          />
          <div className="bg-primary mb-1 w-6 transform rounded-full pt-1 transition-transform duration-300 peer-checked:translate-y-2 peer-checked:-rotate-45"></div>
          <div className="bg-primary mb-1 w-6 rounded-full pt-1 opacity-100 transition-opacity peer-checked:opacity-0"></div>
          <div className="bg-primary w-6 transform rounded-full pt-1 transition-transform duration-300 peer-checked:-translate-y-2 peer-checked:rotate-45"></div>
        </label>
        {/* Click outside menu to hide */}
        <label
          htmlFor="hamburger"
          aria-controls="menu"
          className="pointer-events-none fixed top-0 left-0 z-10 h-screen w-screen opacity-0 backdrop-blur-[6px] transition-opacity duration-300 peer-has-checked:pointer-events-auto peer-has-checked:opacity-50 lg:hidden"
        ></label>
        {/* Menu */}
        <ul className="border-primary bg-background bg-opacity-50 shadow-background-strong invisible absolute top-0 right-0 z-20 w-full origin-top translate-y-[-100%] items-center gap-6 rounded-b-lg border-0 border-b-2 pb-4 opacity-0 shadow-lg backdrop-blur-lg backdrop-filter transition-all duration-300 select-none peer-has-checked:visible peer-has-checked:translate-y-0 peer-has-checked:scale-100 peer-has-checked:opacity-100 sm:top-3 sm:right-10 sm:w-[50%] sm:origin-top-right sm:translate-y-0 sm:scale-[25%] sm:rounded-lg sm:border-2 sm:border-solid sm:pt-4 lg:visible lg:static lg:flex lg:w-full lg:scale-100 lg:transform-none lg:border-none lg:bg-transparent lg:pt-0 lg:pb-0 lg:opacity-100 lg:shadow-none lg:backdrop-blur-none">
          <div className="mt-5 flex justify-center sm:hidden">
            <UserWidget user={user} userLanguage={userLanguage} />
          </div>
          {children}
          <LanguageSelector userLanguage={userLanguage} />
        </ul>
        <div className="mx-3 hidden sm:block">
          <UserWidget user={user} userLanguage={userLanguage} />
        </div>
      </div>
    </nav>
  );
}

export function NavBarItem({ item }: { item: MenuItem }) {
  const pathname = usePathname();

  // Handle edge case for index page ("/")
  const isActive =
    item.url === "/" ? pathname === "/" : pathname?.startsWith(item.url);
  return (
    <Link
      href={item.url}
      className={cn("hover-underline text-primary", {
        "underlined text-primary-strong": isActive,
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
          className={cn("clickable hover-underline text-primary font-sans", {
            "underlined text-primary-strong": isActive(link),
          })}
          href={`/${pathBase}/${link}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

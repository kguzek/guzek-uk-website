"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { GlowCapture } from "@codaworks/react-glow";

import type { User } from "@/payload-types";
import { useScroll } from "@/lib/hooks/scroll";
import { PAGE_NAME } from "@/lib/util";
import { cn } from "@/lib/utils";

import { Logo } from "../image/logo";
import { LanguageSelector } from "./language-selector";
import { UserWidget } from "./user-widget";

interface MenuItem {
  id: number;
  title: string;
  url: string;
  label?: string;
}

function NavBarItem({
  item,
  ...props
}: { item: MenuItem } & Omit<ComponentProps<typeof Link>, "href">) {
  const pathname = usePathname();

  // Handle edge case for index page ("/")
  const isActive = item.url === "/" ? pathname === "/" : pathname?.startsWith(item.url);
  return (
    <Link
      {...props}
      href={item.url}
      className={cn("hover-underline text-primary", {
        "underlined text-primary-strong": isActive,
      })}
    >
      {item.label || item.title}
    </Link>
  );
}

export function NavigationBar({
  user,
  menuItems,
}: {
  user: User | null;
  menuItems: MenuItem[];
}) {
  const { scrollY } = useScroll();
  const hamburgerRef = useRef<HTMLInputElement>(null);

  function closeMenu() {
    if (hamburgerRef.current == null) {
      return;
    }
    hamburgerRef.current.checked = false;
  }

  const userWidget = <UserWidget user={user} closeMenu={closeMenu} />;

  const Comp = scrollY > 0 ? GlowCapture : "div";

  return (
    <nav
      className={cn(
        "fixed top-0 z-10 flex h-(--navbar-height) w-screen items-center gap-4 border-0 border-b border-solid border-transparent bg-transparent px-4 [transition:all_300ms_ease,border-color_1s_ease] sm:h-(--navbar-height-sm) sm:px-10 lg:gap-6",
        {
          "border-background-soft bg-background-strong/70 backdrop-blur-2xl": scrollY > 0,
        },
        // These don't work yet, but will in Tailwind v4.1.0 (hopefully)
        // https://github.com/tailwindlabs/tailwindcss/pull/11929#pullrequestreview-2645322420
        "scripting-none:border-background-soft scripting-none:bg-background-strong/70 scripting-none:backdrop-blur-2xl",
      )}
    >
      <Logo size={80} />
      <p className="font-bold whitespace-nowrap sm:text-3xl">{PAGE_NAME}</p>
      <Comp className="ml-auto flex flex-row-reverse self-stretch lg:flex-row">
        {/* Hamburger */}
        <label
          aria-controls="menu"
          className="peer z-30 flex cursor-pointer flex-col justify-center p-4 lg:hidden"
        >
          <input
            type="checkbox"
            id="hamburger"
            className="peer hidden"
            ref={hamburgerRef}
            aria-controls="menu"
            aria-expanded="false"
            onChange={(event_) =>
              event_.target.setAttribute(
                "aria-expanded",
                event_.target.checked.toString(),
              )
            }
          />
          <div className="bg-primary mb-1.5 w-6 transform rounded-full pt-0.5 transition-transform duration-300 peer-checked:translate-y-2 peer-checked:-rotate-45"></div>
          <div className="bg-primary mb-1.5 w-6 rounded-full pt-0.5 opacity-100 transition-opacity peer-checked:opacity-0"></div>
          <div className="bg-primary w-6 transform rounded-full pt-0.5 transition-transform duration-300 peer-checked:-translate-y-2 peer-checked:rotate-45"></div>
        </label>
        {/* Click outside menu to hide */}
        <label
          htmlFor="hamburger"
          aria-controls="menu"
          className="bg-background-strong/25 pointer-events-none fixed top-0 left-0 z-10 h-screen w-screen opacity-0 backdrop-blur-sm transition-opacity duration-300 peer-has-checked:pointer-events-auto peer-has-checked:opacity-100 lg:hidden"
        ></label>
        {/* Menu */}
        <ul
          id="menu"
          role="menubar"
          aria-label="navigation menu"
          className="border-background-soft bg-gradient-main/50 shadow-background-strong invisible absolute top-0 right-0 z-20 w-full origin-top translate-y-[-100%] items-center gap-6 rounded-b-lg border-0 border-b pb-4 opacity-0 shadow-lg backdrop-blur-2xl transition-all duration-300 select-none peer-has-checked:visible peer-has-checked:translate-y-0 peer-has-checked:scale-100 peer-has-checked:opacity-100 sm:top-3 sm:right-10 sm:w-[50%] sm:origin-top-right sm:translate-y-0 sm:scale-[25%] sm:rounded-lg sm:border sm:border-solid sm:pt-4 lg:visible lg:static lg:flex lg:w-full lg:scale-100 lg:transform-none lg:border-none lg:bg-transparent lg:pt-0 lg:pb-0 lg:opacity-100 lg:shadow-none lg:backdrop-blur-none"
        >
          <div className="mt-5 flex justify-center sm:hidden">{userWidget}</div>
          {menuItems.map((item) => (
            <li className="py-2 text-center" key={`nav-link-${item.id}`}>
              <NavBarItem onClick={closeMenu} item={item} />
            </li>
          ))}
          <LanguageSelector />
        </ul>
        <div className="mx-3 hidden sm:block">{userWidget}</div>
      </Comp>
    </nav>
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

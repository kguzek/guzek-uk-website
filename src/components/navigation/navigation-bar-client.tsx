"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem, User } from "@/lib/types";
import { useTranslations } from "@/context/translation-context";
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

export function UserWidget({ user }: { user: User | null }) {
  const pathname = usePathname();
  const { data } = useTranslations();
  //  add user.url
  const imgUrl =
    (user && Object.hasOwn(user, "url") && (user as any).url) ||
    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png";
  const active =
    pathname != null && ["/profile", "/login"].includes(pathname)
      ? "active"
      : "";
  return (
    <Link
      href={user ? "/profile" : "/login"}
      className={`${active} clickable nav-link user-widget min-w-20`}
      onClick={() => {}}
    >
      <img alt="User avatar" className="user-avatar" src={imgUrl} />
      <b className="user-name whitespace-nowrap">
        {user?.username || data.loginShort}
      </b>
    </Link>
  );
}

interface Page {
  link: string;
  label: string;
}

export function MiniNavBar({
  pathBase,
  pages,
}: {
  pathBase: string;
  pages: Page[];
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
    <nav className="mini-navbar serif mt-2 flex">
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/types";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import Image from "next/image";

export function UserWidget({
  user,
  userLanguage,
}: {
  user: User | null;
  userLanguage: Language;
}) {
  const pathname = usePathname();
  const data = TRANSLATIONS[userLanguage];
  // TODO: add user.url
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
      className={`${active} clickable nav-link user-widget flex min-w-20 flex-col items-center gap-1`}
      onClick={() => {}}
    >
      <Image alt="User avatar" width={40} height={40} src={imgUrl} />
      <b className="user-name whitespace-nowrap">
        {user?.username || data.loginShort}
      </b>
    </Link>
  );
}

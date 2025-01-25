"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/types";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  const isActive =
    pathname != null && ["/profile", "/login"].includes(pathname);
  return (
    <Link
      href={user ? "/profile" : "/login"}
      className={cn("clickable nav-link max-w-[90%] sm:max-w-full", {
        active: isActive,
      })}
      onClick={() => {}}
    >
      <div className="flex flex-col items-center gap-1">
        <Image alt="User avatar" width={40} height={40} src={imgUrl} />
        <b
          className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-[1.2rem] sm:max-w-80 lg:max-w-40"
          title={user?.username}
        >
          {user?.username || data.loginShort}
        </b>
      </div>
    </Link>
  );
}

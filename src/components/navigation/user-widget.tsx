"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { User } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";
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
  const isActive =
    pathname != null && ["/profile", "/login"].includes(pathname);
  return (
    <Link
      href={user ? "/profile" : "/login"}
      className="group text-primary max-w-[90%] font-light sm:max-w-full"
    >
      <div className="flex min-w-20 flex-col items-center gap-1">
        <CircleUserRound />
        <p
          className={cn(
            "hover-underline group-hover:underlined max-w-full overflow-hidden text-[1.2rem] text-ellipsis whitespace-nowrap sm:max-w-80 lg:max-w-40",
            {
              "underlined text-primary-strong": isActive,
            },
          )}
          title={user?.username}
        >
          {user?.username || data.loginShort}
        </p>
      </div>
    </Link>
  );
}

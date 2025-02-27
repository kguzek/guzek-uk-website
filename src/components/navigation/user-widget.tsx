"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Language } from "@/lib/enums";
import type { User } from "@/payload-types";
import { TRANSLATIONS } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

export function UserWidget({
  user,
  userLanguage,
}: {
  user: User | null;
  userLanguage: Language;
}) {
  const pathname = usePathname();
  const data = TRANSLATIONS[userLanguage];
  const isActive = pathname != null && ["/profile", "/login"].includes(pathname);
  return (
    <div className="group text-primary grid h-full max-w-[90%] place-items-center font-light sm:max-w-full">
      {user == null ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="ghost" className="min-w-28">
            <Link href="/signup">{data.profile.formDetails.signup}</Link>
          </Button>
          <Button asChild className="min-w-28">
            <Link href="/login">{data.loginShort}</Link>
          </Button>
        </div>
      ) : (
        <Link href="/profile" className="flex min-w-20 justify-center">
          @
          <span
            className={cn(
              "hover-underline group-hover:underlined max-w-full overflow-hidden text-[1.2rem] text-ellipsis whitespace-nowrap sm:max-w-80 lg:max-w-40",
              {
                "underlined text-primary-strong": isActive,
              },
            )}
            title={user.username}
          >
            {user.username}
          </span>
        </Link>
      )}
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";

import type { User } from "@/payload-types";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

import { ClientLink } from "../link/client";

export function UserWidget({
  user,
  closeMenu,
}: {
  user: User | null;
  closeMenu: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations();
  const isActive = pathname != null && ["/profile", "/login"].includes(pathname);
  return (
    <div className="group text-primary grid h-full max-w-[90%] place-items-center font-light sm:max-w-full">
      {user == null ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="glow" className="min-w-28" onClick={closeMenu}>
            <ClientLink href="/signup">{t("profile.formDetails.signup")}</ClientLink>
          </Button>
          <Button asChild className="min-w-28" onClick={closeMenu}>
            <ClientLink href="/login">{t("loginShort")}</ClientLink>
          </Button>
        </div>
      ) : (
        <Link
          href="/profile"
          className="flex min-w-20 justify-center"
          onClick={closeMenu}
        >
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

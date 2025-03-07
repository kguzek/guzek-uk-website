import type { ComponentProps } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NonOptionalHref {
  href: string | null | undefined;
}

export function ExternalLinkButton({
  href,
  rel,
  children,
  ...props
}: ComponentProps<typeof Button> &
  NonOptionalHref &
  Pick<ComponentProps<typeof Link>, "rel">) {
  if (!href) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild {...props}>
          <Link href={href} rel={rel} className="bg-none!">
            {children}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{href}</TooltipContent>
    </Tooltip>
  );
}

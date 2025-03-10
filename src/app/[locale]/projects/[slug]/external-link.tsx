import type { ComponentProps } from "react";

import { ClientLink } from "@/components/link/client";
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
  Pick<ComponentProps<typeof ClientLink>, "rel">) {
  if (!href) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild {...props}>
          <ClientLink href={href} rel={rel} className="bg-none!">
            {children}
          </ClientLink>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{href}</TooltipContent>
    </Tooltip>
  );
}

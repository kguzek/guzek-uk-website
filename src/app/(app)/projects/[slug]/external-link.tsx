import type { ComponentProps } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ExternalLinkButton({
  href,
  children,
  ...props
}: ComponentProps<typeof Button> & { href: string | null | undefined }) {
  if (!href) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild {...props}>
          <Link href={href} className="bg-none!">
            {children}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{href}</TooltipContent>
    </Tooltip>
  );
}

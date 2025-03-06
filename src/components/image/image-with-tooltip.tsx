import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

import { ExpandableImage } from "./expandable-image";

export function ImageWithTooltip({
  alt,
  className,
  ...props
}: ComponentProps<typeof ExpandableImage>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ExpandableImage alt={alt} {...props} className={cn("mt-0", className)} />
      </TooltipTrigger>
      <TooltipContent side="bottom">{alt}</TooltipContent>
    </Tooltip>
  );
}

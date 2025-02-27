"use client";

import type { ComponentProps } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  disableTransitions = false,
  value,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root> & {
  disableTransitions?: boolean;
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-background relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("bg-accent h-full w-full flex-1", {
          "transition-all": !disableTransitions,
        })}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

"use client";

import type { ComponentProps } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { useElementSize } from "@/hooks/use-element-size";
import { cn } from "@/lib/utils";

export function Progress({
  className,
  disableTransitions = false,
  value,
  steps,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root> & {
  steps?: number;
  disableTransitions?: boolean;
}) {
  const [ref, { width: parentWidth }] = useElementSize();

  const stepWidth = steps == null ? null : Math.floor(parentWidth / steps);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-background relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
      ref={ref}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("bg-accent h-full flex-1", {
          "transition-all": !disableTransitions,
          "w-full": stepWidth == null,
        })}
        style={{
          transform:
            stepWidth == null
              ? `translateX(-${100 - (value ?? 0) * 100}%)`
              : `translateX(${(parentWidth - stepWidth) * (value ?? 0)}px)`,
          width: stepWidth ?? undefined,
        }}
      />
    </ProgressPrimitive.Root>
  );
}

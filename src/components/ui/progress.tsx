"use client";

import type { ComponentProps } from "react";
import { useRef } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  disableTransitions = false,
  value,
  steps,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root> & {
  steps?: number;
  disableTransitions?: boolean;
}) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const parentWidth = parentRef.current?.clientWidth ?? 0;
  const width = steps == null ? undefined : parentWidth / steps;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-background relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
      ref={parentRef}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("bg-accent h-full flex-1", {
          "transition-all": !disableTransitions,
          "w-full": width == null,
        })}
        style={{
          transform:
            width == null
              ? `translateX(-${100 - (value || 0) * 100}%)`
              : `translateX(${(parentWidth - width) * (value || 0)}px)`,
          width,
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function TextWrapper({
  children,
  outer,
  className,
  centered = false,
  ...props
}: ComponentProps<"div"> & { outer?: ReactNode; centered?: boolean }) {
  return (
    <div className={cn("grid w-full place-items-center", className)}>
      <div
        className={cn("max-w-[640px]", {
          "w-full": !centered,
        })}
        {...props}
      >
        {children}
      </div>
      {outer}
    </div>
  );
}

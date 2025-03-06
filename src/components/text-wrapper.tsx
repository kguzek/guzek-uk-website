import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function TextWrapper({
  children,
  before,
  after,
  className,
  centered = false,
  ...props
}: ComponentProps<"div"> & {
  before?: ReactNode;
  after?: ReactNode;
  centered?: boolean;
}) {
  return (
    <div className={cn("grid w-full place-items-center", className)}>
      {before}
      {children && (
        <div
          className={cn("max-w-[640px]", {
            "w-full": !centered,
          })}
          {...props}
        >
          {children}
        </div>
      )}
      {after}
    </div>
  );
}

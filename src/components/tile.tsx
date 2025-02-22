import type { ClassValue } from "clsx";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { Card, CardContent } from "./ui/card";

export function Tile({
  children,
  className,
  containerClassName,
  ...props
}: ComponentProps<typeof CardContent> & { containerClassName?: ClassValue }) {
  return (
    <Card className={cn("w-fit items-center", containerClassName)}>
      <CardContent
        className={cn("flex flex-col items-center gap-3", className)}
        {...props}
      >
        {children}
      </CardContent>
    </Card>
  );
}

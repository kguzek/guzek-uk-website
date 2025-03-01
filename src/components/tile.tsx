import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Glow } from "@codaworks/react-glow";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/ui/card";

export function Tile({
  children,
  className,
  header,
  containerClassName,
  glow = false,
  ...props
}: ComponentProps<typeof CardContent> & {
  containerClassName?: ClassValue;
  header?: ReactNode;
  glow?: boolean;
}) {
  const component = (
    <Card className={cn("glow:border-accent w-fit items-center", containerClassName)}>
      {header}
      <CardContent
        className={cn("flex flex-col items-center gap-3", className)}
        {...props}
      >
        {children}
      </CardContent>
    </Card>
  );
  return glow ? <Glow>{component}</Glow> : component;
}

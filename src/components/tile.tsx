import type { VariantProps } from "class-variance-authority";
import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Glow } from "@codaworks/react-glow";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/ui/card";

export const tileVariants = cva("flex flex-col items-center gap-3", {
  variants: {
    variant: {
      default: "",
      form: "min-w-full sm:min-w-xs",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Tile({
  children,
  className,
  header,
  containerClassName,
  glow = false,
  variant,
  ...props
}: ComponentProps<typeof CardContent> & {
  containerClassName?: ClassValue;
  header?: ReactNode;
  glow?: boolean;
} & VariantProps<typeof tileVariants>) {
  const component = (
    <Card className={cn("glow:border-accent w-fit items-center", containerClassName)}>
      {header}
      <CardContent className={cn(tileVariants({ variant, className }))} {...props}>
        {children}
      </CardContent>
    </Card>
  );
  return glow ? <Glow>{component}</Glow> : component;
}

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Glow } from "@codaworks/react-glow";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader } from "lucide-react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 border border-transparent whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent/80 shadow-xs text-primary-strong shadow-sm hover:bg-accent",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline: "border-input shadow-xs hover:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "border-background-soft hover:border-primary-strong",
        link: "text-primary-strong",
        disabled: "pointer-events-none text-primary/50",
        glow: "border-background-soft glow:bg-accent/10 glow:border-accent glow:text-primary-strong",
      },
      size: {
        default: "h-9 px-4 py-2",
        lg: "h-10 rounded-md px-8",
        sm: "h-9 min-w-9 rounded-md px-2 text-sm",
        "sm-icon":
          "h-7 min-w-7 text-xs sm:h-9 sm:min-w-9 sm:rounded-md sm:px-2 lg:text-sm",
        icon: "h-9 w-9 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  loading = false,
  asChild = false,
  ...props
}: ButtonProps & { loading?: boolean }) {
  const Comp = asChild ? Slot : "button";
  const result = (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader className="animate-spin" /> : props.children}
    </Comp>
  );

  return variant?.endsWith("glow") ? <Glow>{result}</Glow> : result;
}

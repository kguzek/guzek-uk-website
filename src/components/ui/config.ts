import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 border border-transparent whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent shadow-xs text-primary-strong shadow-xs hover:bg-accent/80 hover:text-primary-strong/80",
        cancel: "border-background-soft shadow-xs shadow-xs hover:text-error",
        destructive:
          "bg-transparent border-error shadow-xs text-error shadow-xs hover:bg-error hover:text-primary-strong",
        "super-destructive":
          "relative overflow-hidden bg-success text-primary-strong sm:text-primary hover:text-primary-strong shadow-xs min-w-14",
        outline:
          "border-background-soft shadow-xs hover:border-accent hover:text-primary-strong",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "border-background-soft hover:border-primary-strong",
        link: "text-primary-strong",
        disabled: "pointer-events-none text-primary/50",
        glow: "border-background-soft glow:bg-accent/10 glow:border-accent glow:text-primary-strong",
        "github-glow":
          "bg-primary-strong glow:bg-accent/20 glow:border-accent text-background hover:text-background/80",
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

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

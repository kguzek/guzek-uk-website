import Link from "next/link";
import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

import type { ButtonProps } from "@/ui/button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "disabled" | "size" | "variant"> &
  React.ComponentProps<typeof Link>;

function PaginationLink({
  className,
  isActive,
  size = "sm-icon",
  href,
  disabled,
  variant,
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: disabled ? "disabled" : isActive ? "default" : (variant ?? "outline"),
          size: size,
        }),
        className,
      )}
      href={disabled ? "" : href}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 md:mr-2 md:pl-2.5", className)}
      variant="ghost"
      {...props}
    >
      <ChevronLeftIcon />
      {props.children == null ? null : <span className="mr-2.5">{props.children}</span>}
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 md:ml-2 md:pr-2.5", className)}
      variant="ghost"
      {...props}
    >
      {props.children == null ? null : <span className="ml-2.5">{props.children}</span>}
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex h-9 w-6 items-center justify-center sm:size-9", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-3 sm:size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

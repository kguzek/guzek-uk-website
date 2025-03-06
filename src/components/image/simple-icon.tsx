import type { ClassValue } from "clsx";
import type { ComponentProps } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const simpleIconUrl = (name: string, colored: boolean) =>
  colored
    ? `https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/${name}.png`
    : `https://simpleicons.org/icons/${name}.svg`;

export function SimpleIcon({
  name,
  colored = false,
  tooltip = false,
  alt,
  className,
  ...props
}: { name: string; colored?: boolean; tooltip?: boolean; className?: ClassValue } & Omit<
  ComponentProps<typeof Image>,
  "src"
>) {
  const image = (
    <Image
      alt={alt}
      {...props}
      src={simpleIconUrl(name.trim().toLowerCase(), colored)}
      width={24}
      height={24}
      className={cn("my-0!", className)}
    />
  );
  return tooltip ? (
    <Tooltip>
      <TooltipTrigger>{image}</TooltipTrigger>
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  ) : (
    image
  );
}

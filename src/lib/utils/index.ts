import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomElement<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function isScriptUrl(url: string | null | undefined) {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return !!trimmed.match(/^(?:javascript|data|vbscript):/);
}

export function sanitiseUrl(url: string) {
  if (isScriptUrl(url)) return "";
  return url;
}

export * from "./cssVar";
export * from "./getRenderContainer";
export * from "./isCustomNodeSelected";
export * from "./isTextSelected";

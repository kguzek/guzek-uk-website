"use client";

import type { ToasterProps } from "sonner";
import { Check, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background-strong! group-[.toaster]:text-primary! group-[.toaster]:border-background-soft! group-[.toaster]:shadow-lg ",
          description: "group-[.toast]:text-primary dark:group-[.toast]:text-primary",
          actionButton:
            "group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-50 font-medium dark:group-[.toast]:bg-neutral-50 dark:group-[.toast]:text-neutral-900",
          cancelButton:
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500 font-medium dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-neutral-400",
        },
      }}
      {...props}
    />
  );
}

export const successToast = (message: string) => ({
  icon: <Check className="text-success" />,
  message,
});

export const infoToast = (message: string) => ({
  icon: <Info className="text-accent" />,
  message,
});

export function showSuccessToast(text: string) {
  const { message, ...options } = successToast(text);
  // Timeout needed in case this is called on page load
  setTimeout(() => {
    toast.success(message, options);
  }, 0);
}

export function showInfoToast(text: string) {
  const { message, ...options } = infoToast(text);
  setTimeout(() => {
    toast.info(message, options);
  }, 0);
}

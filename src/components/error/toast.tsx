import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";

import type { Translation } from "@/lib/translations";
import { HttpError, NetworkError } from "@/lib/backend/v2";

export const errorToast = (message: ReactNode) => ({
  icon: <CircleAlert className="text-error not-first:hidden" />,
  message: <p className="ml-2 whitespace-pre-wrap">{message}</p>,
});

export function showErrorToast(text: ReactNode) {
  const { message, ...options } = errorToast(text);
  toast.error(message, { ...options });
}

export const fetchErrorToast =
  (data: Translation, fallbackMessage?: string) => (error: unknown) =>
    errorToast(
      error instanceof HttpError
        ? error.message
        : error instanceof NetworkError
          ? data.networkError
          : (fallbackMessage ?? data.networkError),
    );

import type { ReactNode } from "react";
import type { ExternalToast } from "sonner";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";

import { HttpError, NetworkError } from "@/lib/backend/error-handling";

/** Generic toast config to ensure consistent error message styling. */
export const errorToast = (message: ReactNode) => ({
  icon: <CircleAlert className="text-error not-first:hidden" />,
  message: <p className="ml-2 whitespace-pre-wrap">{message}</p>,
});

/** Used for automatically determining the error option for `toast.promise`. */
export const fetchErrorToast =
  (networkErrorMessage: string, fallbackMessage?: string) => (error: unknown) =>
    errorToast(
      error instanceof HttpError
        ? error.message
        : error instanceof NetworkError
          ? networkErrorMessage
          : (fallbackMessage ?? networkErrorMessage),
    );

/** Used for showing custom error messages in legacy backend. */
export function showErrorToast(text: ReactNode, optionsOverride?: ExternalToast) {
  const { message, ...options } = errorToast(text);
  toast.error(message, { ...options, ...optionsOverride });
}

/** Used for automatically determining error messages in v2 backend. */
export function showFetchErrorToast(
  networkErrorMessage: string,
  error: unknown,
  optionsOverride?: ExternalToast,
) {
  const { message, ...options } = fetchErrorToast(networkErrorMessage)(error);
  toast.error(message, { ...options, ...optionsOverride });
}

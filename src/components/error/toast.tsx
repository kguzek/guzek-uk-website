import { CircleAlert } from "lucide-react";

import type { Translation } from "@/lib/translations";
import { HttpError, NetworkError } from "@/lib/backend/client2";

export const toastError =
  (data: Translation, fallbackMessage?: string) => (error: unknown) => ({
    icon: <CircleAlert className="text-error not-first:hidden" />,
    message: (
      <p className="ml-2">
        {error instanceof HttpError
          ? error.message
          : error instanceof NetworkError
            ? data.networkError
            : (fallbackMessage ?? data.networkError)}
      </p>
    ),
  });

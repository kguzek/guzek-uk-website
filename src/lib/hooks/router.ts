"use client";

import type {
  AppRouterInstance,
  NavigateOptions,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useCallback, useEffect } from "react";
import { done, start } from "nprogress";

import { useIntlRouter, usePathname } from "@/i18n/navigation";

/**
 * Custom useRouter hook to work with NextTopLoader
 * Compatible with app router only.
 * Solution Provided by @sho-pb
 * Compatibility with next-intl by @kguzek
 * ! does not work when navigating to a different locale
 * @returns {AppRouterInstance}
 */
export const useRouter = (): AppRouterInstance => {
  const router = useIntlRouter();
  const pathname = usePathname();
  useEffect(() => {
    done();
  }, [pathname]);
  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (href !== pathname) {
        start();
      }
      router.replace(href, options);
    },
    [router, pathname],
  );

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (href !== pathname) {
        start();
      }
      router.push(href, options);
    },
    [router, pathname],
  );

  return {
    ...router,
    replace,
    push,
  };
};

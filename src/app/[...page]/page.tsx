"use client";

import { use } from "react";
import ErrorPage from "@/components/error-page";
import { useFetch } from "@/context/fetch-context";
import { ErrorCode } from "@/lib/models";
import PageTemplate, { PageSkeleton } from "./page-template";

export function Page({ page = "/" }: { page: string }) {
  const { menuItems } = useFetch();

  if (menuItems == null) {
    return (
      <div className="text">
        <PageSkeleton />
      </div>
    );
  }
  console.log(page, menuItems);

  const currentPage =
    page && menuItems.find((item) => item.shouldFetch && item.url === page);

  if (!currentPage) return <ErrorPage errorCode={ErrorCode.NotFound} />;
  return <PageTemplate pageData={currentPage} />;
}

export default function PageLoader({
  params,
}: {
  params: Promise<{ page: string[] }>;
}) {
  const { page } = use(params);
  const joined = Array.isArray(page) ? page.join("/") : page;
  return <Page page={`/${joined}`} />;
}

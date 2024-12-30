"use client";

import { DynamicPageLoader } from "@/components/pages/dynamic-page";
import { use } from "react";

export default function PageLoader({
  params,
}: {
  params: Promise<{ page: string[] }>;
}) {
  const { page } = use(params);
  const joined = Array.isArray(page) ? page.join("/") : page;
  return <DynamicPageLoader page={`/${joined}`} />;
}

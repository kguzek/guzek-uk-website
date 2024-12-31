import { DynamicPageLoader } from "@/components/pages/dynamic-page";

export default async function PageLoader({
  params,
}: {
  params: Promise<{ page: string[] }>;
}) {
  const { page } = await params;
  const joined = Array.isArray(page) ? page.join("/") : page;
  return <DynamicPageLoader page={`/${joined}`} />;
}

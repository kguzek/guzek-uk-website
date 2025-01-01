import { DynamicPageLoader } from "@/components/pages/dynamic-page";
import { getTitle } from "@/lib/util";

// TODO: proper page title metadata

export async function generateMetadata() {
  return {
    title: getTitle(),
  };
}

export default async function PageLoader({
  params,
}: {
  params: Promise<{ page: string[] }>;
}) {
  const { page } = await params;
  const joined = Array.isArray(page) ? page.join("/") : page;
  return <DynamicPageLoader page={`/${joined}`} />;
}

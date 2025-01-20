import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/enums";
import type { MenuItem, PageContent } from "@/lib/types";
import { serverToApi } from "@/lib/backend/server";
import { revalidatePath } from "next/cache";

export async function getPageBySlug(slug: string) {
  const result = await serverToApi<MenuItem[]>("pages");
  if (!result.ok) {
    console.error("Failed to fetch pages", result);
    return null;
  }
  return result.data.find((item) => item.shouldFetch && item.url === slug);
}

export async function DynamicPageLoader({ page }: { page: string }) {
  const currentPage = await getPageBySlug(page);
  if (!currentPage) return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  const result = await serverToApi<PageContent>(`pages/${currentPage.id}`);
  if (!result.ok) return <ErrorComponent errorResult={result} />;
  if (!result.data.content) {
    console.error("Failed to fetch page content", result);
    revalidatePath(currentPage.url);
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }
  return (
    <div className="text flex justify-center">
      <div
        className="page-content prose mt-6"
        dangerouslySetInnerHTML={{ __html: result.data.content }}
      ></div>
    </div>
  );
}

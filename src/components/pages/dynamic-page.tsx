import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/enums";
import type { MenuItem, PageContent } from "@/lib/types";
import { serverToApi } from "@/lib/backend/server";

export async function getPageBySlug(slug: string) {
  const result = await serverToApi<MenuItem[]>("pages");
  if (!result.ok) {
    console.error("Failed to fetch pages", result);
    return null;
  }
  return result.data.find((item) => item.shouldFetch && item.url === slug);
}

async function getContentById(id: number) {
  const result = await serverToApi<PageContent>(`pages/${id}`);
  if (!result.ok) {
    console.error("Failed to fetch page content", result);
    return null;
  }
  return result.data;
}

export async function DynamicPageLoader({ page }: { page: string }) {
  const currentPage = await getPageBySlug(page);
  if (!currentPage) return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  const content = await getContentById(currentPage.id);
  if (!content) return <ErrorComponent errorCode={ErrorCode.ServerError} />;
  return (
    <div className="text flex justify-center">
      <div
        className="page-content prose mt-6"
        dangerouslySetInnerHTML={{ __html: content.content }}
      ></div>
    </div>
  );
}

import { ErrorComponent } from "@/components/error-component";
import { PageTitle } from "@/components/page-title";
import { ErrorCode } from "@/lib/types";
import type { MenuItem, PageContent } from "@/lib/types";
import { serverToApi } from "@/lib/backend-v2";

async function DynamicPage({ pageData }: { pageData: MenuItem }) {
  const result = await serverToApi<PageContent>(`pages/${pageData.id}`);
  if (!result.ok || !result.hasBody) {
    console.error("Failed to fetch page content", result);
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }

  return (
    <div className="text">
      <PageTitle title={pageData.title} />
      <div
        className="page-content"
        dangerouslySetInnerHTML={{ __html: result.data.content }}
      ></div>
    </div>
  );
}

export async function DynamicPageLoader({ page }: { page: string }) {
  const result = await serverToApi<MenuItem[]>("pages");
  if (!result.ok) {
    console.error("Failed to fetch pages", result);
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }

  const currentPage =
    page && result.data.find((item) => item.shouldFetch && item.url === page);

  if (!currentPage) return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  return <DynamicPage pageData={currentPage} />;
}

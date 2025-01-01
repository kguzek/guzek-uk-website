import { MenuItem, PageContent } from "@/lib/types";
import { Metadata } from "next";
import { useTranslations } from "@/providers/translation-provider";
import { serverToApi } from "@/lib/backend-v2";
import { ErrorComponent } from "@/components/error-component";
import { PagesForm } from "./pages-form";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await useTranslations();
  return { title: data.admin.contentManager.title };
}

export default async function ContentManager() {
  const { data, userLanguage } = await useTranslations();

  const menuItemsResult = await serverToApi<MenuItem[]>("pages");
  if (!menuItemsResult.ok) {
    return <ErrorComponent errorResult={menuItemsResult} />;
  }

  const pageContent: Record<number, PageContent> = {};
  const pagesMap = new Map<number, string>();
  for (const page of menuItemsResult.data) {
    pagesMap.set(page.id, `${page.title} '${page.url}'`);
    if (!page.shouldFetch) continue;
    const contentResult = await serverToApi<PageContent>(`pages/${page.id}`);
    if (!contentResult.ok) {
      return <ErrorComponent errorResult={contentResult} />;
    }
    pageContent[page.id] = contentResult.data;
  }

  return (
    <div>
      <h3>{data.admin.contentManager.title}</h3>
      {menuItemsResult.data.length === 0 ? (
        <button className="btn btn-submit">
          {data.admin.contentManager.addPage}
        </button>
      ) : (
        <PagesForm
          userLanguage={userLanguage}
          pageContent={pageContent}
          pagesMap={pagesMap}
          menuItems={menuItemsResult.data}
        />
      )}
    </div>
  );
}

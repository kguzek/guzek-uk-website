import { MenuItem, PageContent } from "@/lib/types";
import { Metadata } from "next";
import { useTranslations } from "@/providers/translation-provider";
import { getAccessToken, serverToApi } from "@/lib/backend/server";
import { ErrorComponent } from "@/components/error-component";
import { PagesForm } from "./pages-form";
import { ErrorCode } from "@/lib/enums";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await useTranslations();
  return { title: data.admin.contentManager.title };
}

export default async function ContentManager() {
  const { data, userLanguage } = await useTranslations();
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return <ErrorComponent errorCode={ErrorCode.Unauthorized} />;
  }

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
          accessToken={accessToken}
        />
      )}
    </div>
  );
}

import { MenuItem, PageContent } from "@/lib/types";
import { Metadata } from "next";
import { useTranslations } from "@/providers/translation-provider";
import { serverToApi } from "@/lib/backend/server";
import { ErrorComponent } from "@/components/error-component";
import { PagesForm } from "./pages-form";
import { ErrorCode } from "@/lib/enums";
import { getTitle } from "@/lib/util";
import { CreatePageButton } from "./create-page-button";
import { useAuth } from "@/lib/backend/user";

type PageId = MenuItem["id"];

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await useTranslations();
  return { title: getTitle(data.admin.contentManager.title) };
}

export default async function ContentManager() {
  const { data, userLanguage } = await useTranslations();
  const { accessToken } = await useAuth();

  if (!accessToken) {
    return <ErrorComponent errorCode={ErrorCode.Unauthorized} />;
  }

  const menuItemsResult = await serverToApi<MenuItem[]>("pages");
  if (!menuItemsResult.ok) {
    return <ErrorComponent errorResult={menuItemsResult} />;
  }

  const pageContent: Record<PageId, PageContent> = {};
  const pageIdentifiers: Map<PageId, string> = new Map();
  for (const page of menuItemsResult.data) {
    pageIdentifiers.set(page.id, `${page.title} '${page.url}'`);
    if (!page.shouldFetch) continue;
    const contentResult = await serverToApi<PageContent>(`pages/${page.id}`);
    if (!contentResult.ok) {
      return <ErrorComponent errorResult={contentResult} />;
    }
    pageContent[page.id] = contentResult.data;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.admin.contentManager.title}</h3>
      {menuItemsResult.data.length === 0 ? (
        // TODO: button needs initial values to create menu item
        <CreatePageButton
          userLanguage={userLanguage}
          accessToken={accessToken}
        />
      ) : (
        <PagesForm
          userLanguage={userLanguage}
          pageContent={pageContent}
          pageIdentifiers={pageIdentifiers}
          menuItems={menuItemsResult.data}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ErrorComponent } from "@/components/error-component";
import { PageSkeleton } from "./skeleton";
import {
  DEFAULT_PAGE_DATA,
  MenuItem,
  PageContent,
  ErrorCode,
} from "@/lib/types";
import { setTitle } from "@/lib/util";
import { useFetch } from "@/context/fetch-context";
import { useTranslations } from "@/context/translation-context";

const EVENT_DISPATCHER = "document.dispatchEvent(new Event('onImageLoad'));";
const imageInjection = `onload="${EVENT_DISPATCHER}" onerror="${EVENT_DISPATCHER} "`;

function DynamicPage({ pageData }: { pageData: MenuItem }) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [imagesToLoad, setImagesToLoad] = useState(0);
  const pathname = usePathname();
  const { userLanguage } = useTranslations();
  const { tryFetch, reload } = useFetch();

  async function fetchContent() {
    const url = `pages/${pageData.id}`;
    const body = await tryFetch(url, { lang: userLanguage }, DEFAULT_PAGE_DATA);
    const numImages = (body.content.match(/\<img/g) || []).length;
    setImagesToLoad(numImages);
    // Inject code which makes images emit an `onImageLoad` event when they are loaded
    setPageContent({
      ...body,
      content: body.content.replace(/(\<img )/g, "$1" + imageInjection),
    });
  }

  useEffect(() => {
    if (reload) fetchContent();
  }, [reload]);

  useEffect(() => {
    fetchContent();
  }, [userLanguage, pathname]);

  useEffect(() => {
    setTitle(pageData.title);

    document.addEventListener("onImageLoad", onImageLoad, false);
    // Remove the event listener when component unmounts
    return () => document.removeEventListener("onImageLoad", onImageLoad);
  }, [pageData]);

  function onImageLoad() {
    setImagesToLoad((old) => old - 1);
  }

  const loadingImages = imagesToLoad > 0;

  return (
    <div className="text">
      {(!pageContent || loadingImages) && <PageSkeleton />}
      {pageContent && (
        <div
          className={`page-content ${loadingImages ? "display-none" : ""}`}
          dangerouslySetInnerHTML={{ __html: pageContent?.content ?? "" }}
        ></div>
      )}
    </div>
  );
}

export function DynamicPageLoader({ page }: { page: string }) {
  const { menuItems } = useFetch();

  if (menuItems == null) {
    return (
      <div className="text">
        <PageSkeleton />
      </div>
    );
  }
  const currentPage =
    page && menuItems.find((item) => item.shouldFetch && item.url === page);

  if (!currentPage) return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  return <DynamicPage pageData={currentPage} />;
}

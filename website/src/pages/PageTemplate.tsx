import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFetchContext } from "../misc/context";
import { DEFAULT_PAGE_DATA, MenuItem, PageContent } from "../misc/models";
import { setTitle } from "../misc/util";

const EVENT_DISPATCHER = "document.dispatchEvent(new Event('onImageLoad'));";
const imageInjection = `onload="${EVENT_DISPATCHER}" onerror="${EVENT_DISPATCHER} "`;

export function PageSkeleton() {
  return (
    <div className="skeleton">
      <h1 className="skeleton-text" style={{ height: 45 }}></h1>
      <br />
      <h2
        className="skeleton-text"
        style={{ height: 34, width: "20%", minWidth: "8em" }}
      ></h2>
      <p
        className="skeleton-text"
        style={{ height: 26, width: "50%", minWidth: "16em" }}
      ></p>
      <p
        className="skeleton-text"
        style={{ width: "45%", minWidth: "14em" }}
      ></p>
      <p
        className="skeleton-text"
        style={{ height: "50vh", width: "100%" }}
      ></p>
    </div>
  );
}

export default function PageTemplate({
  pageData,
  reload,
  lang,
}: {
  pageData: MenuItem;
  reload: boolean;
  lang: string;
}) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [imagesToLoad, setImagesToLoad] = useState(0);
  const { tryFetch } = useFetchContext();
  const location = useLocation();

  async function fetchContent() {
    const url = `pages/${pageData.id}`;
    const body = await tryFetch(url, { lang }, DEFAULT_PAGE_DATA);
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
  }, [lang, location]);

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

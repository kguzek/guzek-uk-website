import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFetchContext } from "../misc/context";
import { DEFAULT_PAGE_DATA, MenuItem, PageContent } from "../misc/models";
import { setTitle } from "../misc/util";

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
  const { tryFetch } = useFetchContext();
  const location = useLocation();

  async function fetchContent() {
    const url = `pages/${pageData.id}`;
    const body = await tryFetch(url, { lang }, DEFAULT_PAGE_DATA);
    setPageContent(body);
  }

  useEffect(() => {
    if (reload) fetchContent();
  }, [reload]);

  useEffect(() => {
    fetchContent();
  }, [lang, location]);

  useEffect(() => {
    setTitle(pageData.title);
  }, [pageData]);

  return (
    <div
      className="text"
      dangerouslySetInnerHTML={{ __html: pageContent?.content ?? "" }}
    ></div>
  );
}

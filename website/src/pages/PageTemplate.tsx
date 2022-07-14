import React, { useEffect, useState } from "react";
import { fetchCachedData } from "../backend";
import { MenuItem, PageContent } from "../models";

function Home({ pageData, lang }: { pageData: MenuItem; lang: string }) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);

  async function fetchPageContent() {
    const url = "pages" + pageData.url;
    const res = await fetchCachedData(url, "GET", { lang });
    const body: PageContent = await res.json();
    setPageContent(body);
  }

  useEffect(() => {
    fetchPageContent();
  }, [lang]);

  useEffect(() => {
    document.title = pageData.title;
  }, [pageData]);

  return (
    <div className="text">
      <p>{pageContent?.body}</p>
    </div>
  );
}

export default Home;

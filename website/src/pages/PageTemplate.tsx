import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MenuItem, PageContent } from "../models";
import { setTitle, tryFetch } from "../util";

const DEFAULT_DATA: PageContent = {
  content: "Oops! This page hasn't been implemented yet.",
};

function Home({
  pageData,
  reload,
  lang,
}: {
  pageData: MenuItem;
  reload: boolean;
  lang: string;
}) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);

  const location = useLocation();

  async function fetchPageContent() {
    const url = "pages/" + pageData.id;
    const body = await tryFetch(url, { lang }, DEFAULT_DATA);
    setPageContent(body);
  }

  useEffect(() => {
    fetchPageContent();
  }, [reload, lang, location]);

  useEffect(() => {
    setTitle(pageData.title);
  }, [pageData]);

  return (
    <div className="text">
      <p>{pageContent?.content}</p>
    </div>
  );
}

export default Home;

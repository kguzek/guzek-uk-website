import React, { useEffect } from "react";
import { ErrorPageContent } from "../models";

export default function ErrorPage({
  pageData,
}: {
  pageData: ErrorPageContent;
}) {
  useEffect(() => {
    document.title = pageData.title;
  }, [pageData]);

  return (
    <div className="text">
      <p>{pageData.body}</p>
    </div>
  );
}

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ErrorPageContent } from "../misc/models";
import { PAGE_NAME, setTitle } from "../misc/util";

export default function ErrorPage({
  pageData,
}: {
  pageData: ErrorPageContent;
}) {
  useEffect(() => {
    setTitle(pageData.title);
  }, [pageData]);

  return (
    <div className="text">
      <p>{pageData.body}</p>
      <div className="form">
        <Link to="/" className="btn">
          {PAGE_NAME}
        </Link>
      </div>
    </div>
  );
}

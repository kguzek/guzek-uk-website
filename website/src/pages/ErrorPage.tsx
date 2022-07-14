import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ErrorPageContent } from "../models";
import { PAGE_NAME, setTitle } from "../util";

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
      <div className="login">
        <Link to="/" className="login-btn">
          {PAGE_NAME}
        </Link>
      </div>
    </div>
  );
}

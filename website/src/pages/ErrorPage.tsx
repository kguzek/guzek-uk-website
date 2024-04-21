import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ErrorCode } from "../misc/models";
import { Translation } from "../misc/translations";
import { PAGE_NAME, setTitle } from "../misc/util";

export default function ErrorPage({
  pageContent,
  errorCode,
}: {
  pageContent: Translation;
  errorCode: ErrorCode;
}) {
  useEffect(() => {
    setTitle(`${errorCode} ${pageContent.error[errorCode].title}`);
  }, [pageContent]);

  return (
    <div className="text">
      <h1>{errorCode}</h1>
      <p>{pageContent.error[errorCode].body}</p>
      <div className="flex-column">
        <div className="link-container">
          <Link to="/" className="btn">
            {PAGE_NAME}
          </Link>
        </div>
      </div>
    </div>
  );
}

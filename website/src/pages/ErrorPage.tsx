import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ErrorCode } from "../misc/models";
import { Translation } from "../misc/translations";
import { PAGE_NAME, setTitle } from "../misc/util";

export default function ErrorPage({
  data,
  errorCode,
}: {
  data: Translation;
  errorCode: ErrorCode;
}) {
  useEffect(() => {
    setTitle(`${errorCode} ${data.error[errorCode].title}`);
  }, [data]);

  return (
    <div className="text">
      <h1>{errorCode}</h1>
      <p>{data.error[errorCode].body}</p>
      <div className="flex-column">
        <div className="link-container">
          {errorCode === ErrorCode.Unauthorized ? (
            <Link to="/login" className="btn">
              {data.profile.formDetails.login}
            </Link>
          ) : (
            <Link to="/" className="btn">
              {PAGE_NAME}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

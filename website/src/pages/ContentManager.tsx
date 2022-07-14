import React, { useEffect } from "react";
import { ErrorCode, User } from "../models";
import { Translation } from "../translations";
import { setTitle } from "../util";
import ErrorPage from "./ErrorPage";

export default function ContentManager({
  data,
  user,
}: {
  data: Translation;
  user: User | null;
}) {
  useEffect(() => {
    setTitle(data.contentManager.title);
  }, []);

  if (!user?.admin) {
    return <ErrorPage pageData={data.error[ErrorCode.Forbidden]} />;
  }

  return (
    <div className="text">
      <p>{data.contentManager.title}</p>
    </div>
  );
}

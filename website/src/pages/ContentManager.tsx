import React, { useEffect, useState } from "react";
import DropdownBox from "../components/Forms/DropdownBox";
import { ErrorCode, MenuItem, User } from "../models";
import { Translation } from "../translations";
import { setTitle } from "../util";
import ErrorPage from "./ErrorPage";

export default function ContentManager({
  data,
  user,
  menuItems,
}: {
  data: Translation;
  user: User | null;
  menuItems: MenuItem[];
}) {
  const [selectedPage, setSelectedPage] = useState();

  useEffect(() => {
    setTitle(data.contentManager.title);
  }, []);

  if (!user?.admin) {
    return <ErrorPage pageData={data.error[ErrorCode.Forbidden]} />;
  }

  return (
    <div className="text">
      <p>{data.contentManager.title}</p>
      <form className="centred">
        <DropdownBox
          label={data.contentManager.selectedPage}
          value={selectedPage}
          setValue={setSelectedPage}
          options={menuItems.map((menuItem) => menuItem.title)}
        />
      </form>
    </div>
  );
}

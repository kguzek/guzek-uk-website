import React, { FormEvent, useEffect, useState } from "react";
import InputBox from "../components/Forms/InputBox";
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
  const [selectedPageID, setSelectedPageID] = useState(menuItems[0]?.id ?? 0);

  useEffect(() => {
    setTitle(data.contentManager.title);
  }, []);

  if (!user?.admin) {
    return <ErrorPage pageData={data.error[ErrorCode.Forbidden]} />;
  }

  const pagesMap = new Map<number, string>();
  menuItems.forEach((page) =>
    pagesMap.set(page.id, `${page.title} '${page.url}'`)
  );

  const selectedPage = menuItems.find((page) => page.id === selectedPageID);

  function handleSubmit(evt: FormEvent) {
    evt.preventDefault();
    console.log("Submitted");
  }

  return (
    <div className="text">
      <p>{data.contentManager.title}</p>
      {menuItems.length === 0 ? (
        <button className="btn submit-btn">
          {data.contentManager.addPage}
        </button>
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          <InputBox
            type="dropdown"
            label={data.contentManager.selectedPage}
            value={selectedPageID}
            setValue={setSelectedPageID}
            options={pagesMap}
          />
          <PagesEditor data={data} originalPage={selectedPage as MenuItem} />
        </form>
      )}
    </div>
  );
}

function PagesEditor({
  data,
  originalPage,
}: {
  data: Translation;
  originalPage: MenuItem;
}) {
  const [page, setPage] = useState<MenuItem>();

  useEffect(() => {
    setPage(originalPage);
  }, [originalPage]);

  const PROPERTIES: Array<"title" | "url"> = ["title", "url"];

  function handleUpdate(changedProperty: string, newValue: string) {
    setPage((current) => ({
      ...(current ?? originalPage),
      [changedProperty]: newValue,
    }));
  }

  return (
    <>
      {PROPERTIES.map((property, idx) => (
        <InputBox
          key={idx}
          label={data.contentManager.formDetails[property]}
          setValue={(val: string) => handleUpdate(property, val)}
          value={page?.[property] ?? ""}
          required
        />
      ))}
      <button type="submit" className="btn btn-submit">
        {data.contentManager.formDetails.update}
      </button>
    </>
  );
}

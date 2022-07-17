import React, { FormEvent, useEffect, useState } from "react";
import { fetchFromAPI } from "../backend";
import InputArea, { getEmptyMarkdown } from "../components/Forms/InputArea";
import InputBox from "../components/Forms/InputBox";
import { ErrorCode, MenuItem, User } from "../models";
import { Translation } from "../translations";
import { setTitle } from "../util";
import ErrorPage from "./ErrorPage";

const PAGE_PROPERTIES: {
  text: Array<"title" | "url">;
  bool: Array<"adminOnly" | "shouldFetch">;
} = {
  text: ["title", "url"],
  bool: ["adminOnly", "shouldFetch"],
};

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

  return (
    <div className="text">
      <p>{data.contentManager.title}</p>
      {menuItems.length === 0 ? (
        <button className="btn submit-btn">
          {data.contentManager.addPage}
        </button>
      ) : (
        <form className="form">
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
  const [page, setPage] = useState<MenuItem>(originalPage);
  const [content, setContent] = useState(getEmptyMarkdown());

  useEffect(() => {
    if (originalPage.id === page.id) return;
    setPage(originalPage);
  }, [originalPage]);

  function handleUpdate(changedProperty: string, newValue: string | boolean) {
    console.log("Set", changedProperty, "to", newValue);
    setPage((current) => ({
      ...(current ?? originalPage),
      [changedProperty]: newValue,
    }));
  }

  async function handleSubmit(evt: FormEvent) {
    evt.preventDefault();
    console.log("Submitted");
    const url = "";
    const res = await fetchFromAPI(url, "PUT", {
      ...page,
      content: content.toString("html"),
    });
  }

  return (
    <>
      {PAGE_PROPERTIES.text.map((property, idx) => (
        <InputBox
          key={idx}
          label={data.contentManager.formDetails[property]}
          setValue={(val: string) => handleUpdate(property, val)}
          value={page[property] ?? ""}
          required
        />
      ))}
      {PAGE_PROPERTIES.bool.map((property, idx) => (
        <InputBox
          key={idx}
          type="checkbox"
          label={data.contentManager.formDetails[property]}
          setValue={(val: boolean) => handleUpdate(property, val)}
          value={page[property] ?? false}
        />
      ))}
      {page.shouldFetch && <InputArea value={content} setValue={setContent} />}
      <button type="submit" className="btn btn-submit" onClick={handleSubmit}>
        {data.contentManager.formDetails.update}
      </button>
    </>
  );
}

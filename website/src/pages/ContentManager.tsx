import React, { FormEvent, useEffect, useState } from "react";
import { EditorValue } from "react-rte";
import { fetchFromAPI, getRequest } from "../backend";
import InputArea, {
  getEmptyMarkdown,
  parseMarkdown,
} from "../components/Forms/InputArea";
import InputBox from "../components/Forms/InputBox";
import { LoadingButton } from "../components/LoadingScreen";
import { MenuItem } from "../models";
import { Translation } from "../translations";
import { fetchPageContent, setTitle } from "../util";

type PropertyName = keyof (
  | MenuItem
  | Translation["contentManager"]["formDetails"]
);

const TEXT_PAGE_PROPERTIES: PropertyName[] = ["title", "url"];
const BOOL_PAGE_PROPERTIES: PropertyName[] = ["adminOnly", "shouldFetch"];

export default function ContentManager({
  data,
  lang,
  menuItems,
  reloadSite,
}: {
  data: Translation;
  lang: string;
  menuItems: MenuItem[];
  reloadSite: () => void;
}) {
  const [selectedPageID, setSelectedPageID] = useState(menuItems[0]?.id ?? 0);

  useEffect(() => {
    setTitle(data.contentManager.title);
  }, []);

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
          <PagesEditor
            data={data}
            lang={lang}
            originalPage={selectedPage as MenuItem}
            reloadSite={reloadSite}
          />
        </form>
      )}
    </div>
  );
}

function PagesEditor({
  data,
  lang,
  originalPage,
  reloadSite,
}: {
  data: Translation;
  lang: string;
  originalPage: MenuItem;
  reloadSite: () => void;
}) {
  const [page, setPage] = useState<MenuItem>(originalPage);
  const [content, setContent] = useState(getEmptyMarkdown());
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    if (originalPage.shouldFetch) {
      fetchPageContent(originalPage.id, lang, (val) =>
        setContent(parseMarkdown(val.content, "html"))
      );
    } else {
      setContent(getEmptyMarkdown());
    }
    if (originalPage.id === page.id) return;
    setPage(originalPage);
  }, [originalPage]);

  function handleUpdate(changedProperty: string, newValue: string | boolean) {
    console.debug("Set", changedProperty, "to", newValue);
    if (!unsavedChanges) setUnsavedChanges(true);
    setPage((current) => ({
      ...(current ?? originalPage),
      [changedProperty]: newValue,
    }));
  }

  async function handleSubmit(evt: FormEvent) {
    evt.preventDefault();
    setClickedSubmit(true);
    const url = `pages/${page.id}?lang=${lang}`;
    const req = getRequest(url, "PUT", {
      body: {
        ...page,
        content: content.toString("html"),
      },
    });
    try {
      const res = await fetchFromAPI(req);
      if (res.ok) {
        reloadSite();
        setUnsavedChanges(false);
      }
    } catch {}
    setClickedSubmit(false);
  }

  return (
    <>
      {TEXT_PAGE_PROPERTIES.map((property, idx) => (
        <InputBox
          key={idx}
          label={data.contentManager.formDetails[property]}
          setValue={(val: string) => handleUpdate(property, val)}
          value={page[property]}
          required
        />
      ))}
      {BOOL_PAGE_PROPERTIES.map((property, idx) => (
        <InputBox
          key={idx}
          type="checkbox"
          label={data.contentManager.formDetails[property]}
          setValue={(val: boolean) => handleUpdate(property, val)}
          value={page[property]}
        />
      ))}
      {page.shouldFetch && (
        <InputArea
          value={content}
          setValue={(html: EditorValue) => {
            if (!unsavedChanges) setUnsavedChanges(true);
            setContent(html);
          }}
        />
      )}
      {clickedSubmit ? (
        <LoadingButton className="flex-column" />
      ) : (
        <button
          type="submit"
          className="btn btn-submit"
          disabled={!unsavedChanges}
          onClick={handleSubmit}
        >
          {data.contentManager.formDetails.update}
        </button>
      )}
    </>
  );
}

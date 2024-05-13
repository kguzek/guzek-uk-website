import React, { FormEvent, useContext, useEffect, useState } from "react";
import { EditorValue } from "react-rte";
import {
  ModalContext,
  TranslationContext,
  useFetchContext,
} from "../../misc/context";
import InputArea, {
  getEmptyMarkdown,
  parseMarkdown,
} from "../../components/Forms/InputArea";
import InputBox from "../../components/Forms/InputBox";
import LoadingScreen, {
  LoadingButton,
} from "../../components/LoadingScreen/LoadingScreen";
import { DEFAULT_PAGE_DATA, MenuItem } from "../../misc/models";
import { getErrorMessage } from "../../misc/util";
import { useOutletContext } from "react-router-dom";
import { AdminContext } from "./Base";

const TEXT_PAGE_PROPERTIES = ["title", "url"] as const;
const BOOL_PAGE_PROPERTIES = ["adminOnly", "localUrl", "shouldFetch"] as const;

export default function ContentManager({
  lang,
  menuItems,
}: {
  lang: string;
  menuItems: null | MenuItem[];
}) {
  const [selectedPageID, setSelectedPageID] = useState(0);
  const data = useContext(TranslationContext);
  const { setTitle } = useOutletContext<AdminContext>();

  useEffect(() => {
    setTitle(data.admin.contentManager.title);
  }, [data]);

  useEffect(() => {
    if (!menuItems) return;
    setSelectedPageID(menuItems[0]?.id ?? 0);
  }, [menuItems]);

  // TODO: change to skeleton
  if (!menuItems) return <LoadingScreen />;

  const pagesMap = new Map<number, string>();
  menuItems.forEach((page) =>
    pagesMap.set(page.id, `${page.title} '${page.url}'`)
  );

  const selectedPage = menuItems.find((page) => page.id === selectedPageID);

  return (
    <div>
      <h3>{data.admin.contentManager.title}</h3>
      {menuItems.length === 0 ? (
        <button className="btn btn-submit">
          {data.admin.contentManager.addPage}
        </button>
      ) : (
        <>
          <form className="form-editor flex-column gap-15">
            <InputBox
              type="dropdown"
              label={data.admin.contentManager.selectedPage}
              value={selectedPageID}
              setValue={setSelectedPageID}
              options={pagesMap}
            />
            {selectedPage && (
              <PagesEditor
                lang={lang}
                originalPage={selectedPage as MenuItem}
              />
            )}
          </form>
        </>
      )}
    </div>
  );
}

function PagesEditor({
  lang,
  originalPage,
}: {
  lang: string;
  originalPage: MenuItem;
}) {
  const [page, setPage] = useState<MenuItem>(originalPage);
  const [content, setContent] = useState(getEmptyMarkdown());
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const data = useContext(TranslationContext);
  const { fetchFromAPI, tryFetch, removeOldCaches } = useFetchContext();
  const { setModalError } = useContext(ModalContext);

  useEffect(() => {
    if (originalPage.shouldFetch) {
      fetchContent();
    } else {
      setContent(getEmptyMarkdown());
    }
    if (originalPage.id === page.id && originalPage.title === page.title)
      return;
    setPage(originalPage);
  }, [originalPage, lang]);

  async function fetchContent() {
    const url = `pages/${originalPage.id}`;
    const body = await tryFetch(url, { lang }, DEFAULT_PAGE_DATA);
    setContent(parseMarkdown(body.content, "html"));
  }

  function handleUpdate(changedProperty: string, newValue: string | boolean) {
    // console.debug("Set", changedProperty, "to", newValue);
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
    try {
      const res = await fetchFromAPI(url, {
        method: "PUT",
        body: { ...page, content: content.toString("html") },
      });
      if (res.ok) {
        removeOldCaches();
        setUnsavedChanges(false);
      } else {
        const json = await res.json();
        setModalError(getErrorMessage(res, json, data));
      }
    } catch {
      setModalError(data.networkError);
    }
    setClickedSubmit(false);
  }

  return (
    <>
      {TEXT_PAGE_PROPERTIES.map((property, idx) => (
        <InputBox
          key={idx}
          label={data.admin.contentManager.formDetails[property]}
          setValue={(val: string) => handleUpdate(property, val)}
          value={page[property]}
          required
        />
      ))}
      <div className="form-checkboxes flex-wrap">
        {BOOL_PAGE_PROPERTIES.map((property, idx) => (
          <InputBox
            key={idx}
            type="checkbox"
            label={data.admin.contentManager.formDetails[property]}
            setValue={(val: boolean) => handleUpdate(property, val)}
            value={page[property]}
          />
        ))}
      </div>
      {page.shouldFetch && (
        <div className="text-editor">
          <InputArea
            value={content}
            setValue={(html: EditorValue) => {
              if (!unsavedChanges) setUnsavedChanges(true);
              setContent(html);
            }}
          />
        </div>
      )}
      {clickedSubmit ? (
        <LoadingButton />
      ) : (
        <button
          type="submit"
          className="btn btn-submit"
          disabled={!unsavedChanges}
          onClick={handleSubmit}
        >
          {data.admin.contentManager.formDetails.update}
        </button>
      )}
    </>
  );
}

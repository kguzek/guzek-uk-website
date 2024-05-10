import React, { FormEvent, useContext, useEffect, useState } from "react";
import { EditorValue } from "react-rte";
import {
  AuthContext,
  ModalContext,
  TranslationContext,
  useFetchContext,
} from "../../misc/context";
import InputArea, {
  getEmptyMarkdown,
  parseMarkdown,
} from "../../components/Forms/InputArea";
import InputBox from "../../components/Forms/InputBox";
import { LoadingButton } from "../../components/LoadingScreen/LoadingScreen";
import {
  DEFAULT_PAGE_DATA,
  MenuItem,
  StateSetter,
  User,
} from "../../misc/models";
import { getErrorMessage, setTitle } from "../../misc/util";

const TEXT_PAGE_PROPERTIES = ["title", "url"] as const;
const BOOL_PAGE_PROPERTIES = ["adminOnly", "localUrl", "shouldFetch"] as const;

export default function ContentManager({
  lang,
  menuItems,
  reloadSite,
}: {
  lang: string;
  menuItems: MenuItem[];
  reloadSite: () => void;
}) {
  const [selectedPageID, setSelectedPageID] = useState(menuItems[0]?.id ?? 0);
  const data = useContext(TranslationContext);
  const { logout, setUser } = useContext(AuthContext);

  useEffect(() => {
    setTitle(data.admin.contentManager.title);
  }, [data]);

  const pagesMap = new Map<number, string>();
  menuItems.forEach((page) =>
    pagesMap.set(page.id, `${page.title} '${page.url}'`)
  );

  const selectedPage = menuItems.find((page) => page.id === selectedPageID);

  return (
    <div className="text">
      <h2>{data.admin.contentManager.title}</h2>
      {menuItems.length === 0 ? (
        <button className="btn btn-submit">
          {data.admin.contentManager.addPage}
        </button>
      ) : (
        <>
          <form className="form-editor">
            <InputBox
              type="dropdown"
              label={data.admin.contentManager.selectedPage}
              value={selectedPageID}
              setValue={setSelectedPageID}
              options={pagesMap}
            />
            <PagesEditor
              lang={lang}
              originalPage={selectedPage as MenuItem}
              reloadSite={reloadSite}
              setUser={setUser}
              logout={logout}
            />
          </form>
        </>
      )}
    </div>
  );
}

function PagesEditor({
  lang,
  originalPage,
  reloadSite,
  setUser,
  logout,
}: {
  lang: string;
  originalPage: MenuItem;
  reloadSite: () => void;
  setUser: StateSetter<User | null>;
  logout: () => void;
}) {
  const [page, setPage] = useState<MenuItem>(originalPage);
  const [content, setContent] = useState(getEmptyMarkdown());
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const data = useContext(TranslationContext);
  const { fetchFromAPI, tryFetch } = useFetchContext();
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
        reloadSite();
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

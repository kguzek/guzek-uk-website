import React, { FormEvent, useEffect, useState } from "react";
import { EditorValue } from "react-rte";
import { fetchFromAPI } from "../misc/backend";
import InputArea, {
  getEmptyMarkdown,
  parseMarkdown,
} from "../components/Forms/InputArea";
import InputBox from "../components/Forms/InputBox";
import { LoadingButton } from "../components/LoadingScreen";
import { MenuItem } from "../misc/models";
import { Translation } from "../misc/translations";
import { fetchPageContent, setTitle } from "../misc/util";
import Modal from "../components/Modal";

type PropertyName = keyof (
  | MenuItem
  | Translation["contentManager"]["formDetails"]
);

const TEXT_PAGE_PROPERTIES: PropertyName[] = ["title", "url"];
const BOOL_PAGE_PROPERTIES: PropertyName[] = [
  "adminOnly",
  "localUrl",
  "shouldFetch",
];

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
  }, [data]);

  const pagesMap = new Map<number, string>();
  menuItems.forEach((page) =>
    pagesMap.set(page.id, `${page.title} '${page.url}'`)
  );

  const selectedPage = menuItems.find((page) => page.id === selectedPageID);

  return (
    <div className="text">
      <h2>{data.contentManager.title}</h2>
      {menuItems.length === 0 ? (
        <button className="btn btn-submit">
          {data.contentManager.addPage}
        </button>
      ) : (
        <>
          <form className="form-editor">
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
        </>
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (originalPage.shouldFetch) {
      fetchPageContent(originalPage.id, lang, (val) =>
        setContent(parseMarkdown(val.content, "html"))
      );
    } else {
      setContent(getEmptyMarkdown());
    }
    if (originalPage.id === page.id && originalPage.title === page.title)
      return;
    setPage(originalPage);
  }, [originalPage, lang]);

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
        setModalVisible(true);
        const errorObject = await res.json();
        const [code, description] = Object.entries(errorObject)[0];
        setModalMessage(`Error: ${description} (${code})`);
      }
    } catch {
      setModalVisible(true);
      setModalMessage(
        "A network error occurred when performing this action. Please check the developer console for more details."
      );
    }
    setClickedSubmit(false);
  }

  return (
    <>
      <Modal
        className="error"
        message={modalMessage}
        visible={modalVisible}
        onClick={() => setModalVisible(false)}
      ></Modal>
      {TEXT_PAGE_PROPERTIES.map((property, idx) => (
        <InputBox
          key={idx}
          label={data.contentManager.formDetails[property]}
          setValue={(val: string) => handleUpdate(property, val)}
          value={page[property]}
          required
        />
      ))}
      <div className="form-checkboxes">
        {BOOL_PAGE_PROPERTIES.map((property, idx) => (
          <InputBox
            key={idx}
            type="checkbox"
            label={data.contentManager.formDetails[property]}
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

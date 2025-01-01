"use client";

import { FormEvent, useState } from "react";
import { Language } from "@/lib/enums";
import { MenuItem, PageContent } from "@/lib/types";
import { useModals } from "@/context/modal-context";
import { TRANSLATIONS } from "@/lib/translations";
import { useFetch } from "@/context/fetch-context";
import { getErrorMessage } from "@/lib/util";
import InputBox from "@/components/forms/input-box";
import { LoadingButton } from "@/components/loading/loading-button";
import InputArea from "@/components/forms/input-area";

const TEXT_PAGE_PROPERTIES = ["title", "url"] as const;
const BOOL_PAGE_PROPERTIES = ["adminOnly", "localUrl", "shouldFetch"] as const;

export function PagesForm({
  userLanguage,
  pageContent,
  menuItems,
  pagesMap,
}: {
  userLanguage: Language;
  pageContent: Record<number, PageContent>;
  menuItems: MenuItem[];
  pagesMap: Map<number, string>;
}) {
  const data = TRANSLATIONS[userLanguage];
  const [selectedPageId, setSelectedPageId] = useState(menuItems[0]?.id ?? 0);
  const selectedPage = menuItems.find((page) => page.id === selectedPageId);
  return (
    <form className="form-editor flex-column gap-15">
      <InputBox
        type="dropdown"
        label={data.admin.contentManager.selectedPage}
        value={selectedPageId}
        setValue={setSelectedPageId}
        options={pagesMap}
      />
      {selectedPage && (
        <PagesEditor
          userLanguage={userLanguage}
          originalPage={selectedPage as MenuItem}
          pageContent={pageContent[selectedPageId]}
        />
      )}
    </form>
  );
}

function PagesEditor({
  userLanguage,
  originalPage,
  pageContent,
}: {
  userLanguage: Language;
  originalPage: MenuItem;
  pageContent: PageContent | undefined;
}) {
  const [page, setPage] = useState<MenuItem>(originalPage);
  const [content, setContent] = useState(pageContent?.content ?? "");
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { fetchFromAPI, removeOldCaches } = useFetch();
  const { setModalError } = useModals();
  const data = TRANSLATIONS[userLanguage];

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
    const url = `pages/${page.id}?lang=${userLanguage}`;
    try {
      const res = await fetchFromAPI(url, {
        method: "PUT",
        body: { ...page, content },
      });
      if (!res) throw new Error("BEEP BOOOOOOOOOOP v2");
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
            setValue={(html: string) => {
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

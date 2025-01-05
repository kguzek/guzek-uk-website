"use client";

import { useModals } from "@/context/modal-context";
import { clientToApi } from "@/lib/backend/client";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";

export function CreatePageButton({
  userLanguage,
  accessToken,
}: {
  userLanguage: Language;
  accessToken: string;
}) {
  const data = TRANSLATIONS[userLanguage];
  const { setModalError, setModalInfo } = useModals();

  async function createPage() {
    const body = {};
    const result = await clientToApi("pages", accessToken, {
      method: "POST",
      body,
      params: { lang: userLanguage },
      userLanguage,
      setModalError,
    });
    if (result.ok) {
      setModalInfo(`Successfully created new page!`);
    }
  }

  return (
    <div className="flex w-full justify-center">
      <button className="btn btn-submit" onClick={createPage} disabled>
        {data.admin.contentManager.addPage}
      </button>
    </div>
  );
}

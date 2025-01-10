"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import InputBox from "@/components/forms/input-box";
import type { User } from "@/lib/types";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { useModals } from "@/context/modal-context";
import { clientToApi } from "@/lib/backend/client";

export function ProfileForm({
  user,
  userLanguage,
  accessToken,
}: {
  user: User;
  userLanguage: Language;
  accessToken: string;
}) {
  const [serverUrl, setServerUrl] = useState(user.serverUrl || "");
  const [updating, setUpdating] = useState(false);
  const { setModalError, setModalInfo } = useModals();
  const data = TRANSLATIONS[userLanguage];

  const isServerUrlValid = () =>
    !updating &&
    serverUrl &&
    serverUrl !== "" &&
    serverUrl !== (user.serverUrl ?? "") &&
    serverUrl.match(/^https?:\/\/.+/);

  async function handleUpdateServerUrl(evt: MouseEvent<HTMLButtonElement>) {
    evt.preventDefault();
    if (!user) return;
    setUpdating(true);
    const newServerUrl = serverUrl.endsWith("/") ? serverUrl : serverUrl + "/";
    const result = await clientToApi(
      `auth/users/${user.uuid}/details`,
      accessToken,
      {
        method: "PUT",
        body: { serverUrl: newServerUrl },
        userLanguage,
        setModalError,
      },
    );
    if (result.ok) {
      setServerUrl(newServerUrl);
      setModalInfo(data.profile.serverUrlUpdated(newServerUrl));
      // const newUser = { ...user, serverUrl: newServerUrl };
      // TODO: implement setUser
      // setUser(newUser);
    }
    setUpdating(false);
  }

  return (
    <form className="profile-form flex gap-10">
      <div style={{ width: "100%" }}>
        <InputBox
          label={data.profile.formDetails.serverUrl}
          value={serverUrl}
          setValue={setServerUrl}
          required={false}
          info={
            <button
              type="button"
              className="clickable !cursor-help border-none bg-none text-primary-strong"
              onClick={(evt) => {
                evt.preventDefault();
                setModalInfo(data.liveSeries.explanation);
              }}
            >
              <i>{data.liveSeries.whatsThis}</i>
            </button>
          }
        />
      </div>
      <button
        type="submit"
        className="btn"
        disabled={!isServerUrlValid()}
        onClick={handleUpdateServerUrl}
      >
        {data.admin.contentManager.formDetails.update}
      </button>
    </form>
  );
}

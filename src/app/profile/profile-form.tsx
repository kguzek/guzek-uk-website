"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { getErrorMessage } from "@/lib/util";
import InputBox from "@/components/forms/input-box";
import type { User } from "@/lib/types";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { useFetch } from "@/context/fetch-context";
import { useModals } from "@/context/modal-context";

export function ProfileForm({
  user,
  userLanguage,
}: {
  user: User;
  userLanguage: Language;
}) {
  const [serverUrl, setServerUrl] = useState(user.serverUrl || "");
  const [updating, setUpdating] = useState(false);
  const { fetchFromAPI } = useFetch();
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
    const res = await fetchFromAPI(`auth/users/${user.uuid}/details`, {
      method: "PUT",
      body: { serverUrl: newServerUrl },
    });
    const json = await res.json();
    if (res.ok) {
      setServerUrl(newServerUrl);
      setModalInfo(data.profile.serverUrlUpdated(newServerUrl));
      // const newUser = { ...user, serverUrl: newServerUrl };
      // TODO: implement setUser
      // setUser(newUser);
    } else {
      setModalError(getErrorMessage(res, json, data));
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
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "help",
              }}
              onClick={(evt) => {
                evt.preventDefault();
                setModalInfo(data.liveSeries.explanation);
              }}
            >
              <i className="whats-this">{data.liveSeries.whatsThis}</i>
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

"use client";

import { MouseEvent, useState } from "react";
import { getErrorMessage } from "@/lib/util";
import InputBox from "@/components/forms/input-box";
import { useTranslations } from "@/context/translation-context";
import { useFetch } from "@/context/fetch-context";
import { useModals } from "@/context/modal-context";
import { User } from "@/lib/types";

export function ProfileForm({ user }: { user: User }) {
  const [serverUrl, setServerUrl] = useState(user.serverUrl || "");
  const [updating, setUpdating] = useState(false);
  const { data } = useTranslations();
  const { fetchFromAPI } = useFetch();
  const { setModalError, setModalInfo } = useModals();

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
    <form className="flex gap-10 profile-form">
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

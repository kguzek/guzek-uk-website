"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { InputBox } from "@/components/forms/input-box";
import type { User } from "@/lib/types";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { useModals } from "@/context/modal-context";
import { clientToApi, triggerTokenRefresh } from "@/lib/backend/client";

export function ProfileForm({
  user,
  userLanguage,
  accessToken,
}: {
  user: User;
  userLanguage: Language;
  accessToken: string;
}) {
  const [previousServerUrl, setPreviousServerUrl] = useState(
    user.serverUrl || "",
  );
  const [serverUrl, setServerUrl] = useState(previousServerUrl);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { setModalError, setModalInfo } = useModals();
  const data = TRANSLATIONS[userLanguage];

  const isSubmitButtonDisabled = () =>
    updating ||
    serverUrl === "" ||
    serverUrl === previousServerUrl ||
    !serverUrl.match(/^https?:\/\/.+/);

  const detailsRequestPath = "auth/users/me/details";

  useEffect(() => {
    setSubmitButtonDisabled(!isSubmitButtonDisabled());
  }, [serverUrl, previousServerUrl, updating]);

  async function handleUpdateServerUrl(evt: FormEvent) {
    evt.preventDefault();
    if (!user) return;
    setUpdating(true);
    const newServerUrl = serverUrl.endsWith("/") ? serverUrl : serverUrl + "/";
    const result = await clientToApi(detailsRequestPath, accessToken, {
      method: "PUT",
      body: { serverUrl: newServerUrl },
      userLanguage,
      setModalError,
    });
    if (result.ok) {
      setServerUrl(newServerUrl);
      setPreviousServerUrl(newServerUrl);
      await triggerTokenRefresh();
      setModalInfo(data.profile.serverUrlUpdated(newServerUrl));
    }
    setUpdating(false);
  }

  return (
    <form
      action={`https://auth.guzek.uk/${detailsRequestPath}`}
      method="POST"
      className="profile-form flex gap-10"
      onSubmit={handleUpdateServerUrl}
    >
      <input className="hidden" type="hidden" name="_method" value="PUT" />
      <div style={{ width: "100%" }}>
        <InputBox
          label={data.profile.formDetails.serverUrl}
          value={serverUrl}
          setValue={setServerUrl}
          required={false}
          name="serverUrl"
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
      <button type="submit" className="btn" disabled={submitButtonDisabled}>
        {data.admin.contentManager.formDetails.update}
      </button>
    </form>
  );
}

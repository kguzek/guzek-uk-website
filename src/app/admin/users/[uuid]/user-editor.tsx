"use client";

import { FormEvent, useState } from "react";
import InputBox from "@/components/forms/input-box";
import { LoadingButton } from "@/components/loading/loading-button";
import { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { User } from "@/lib/types";
import { useModals } from "@/context/modal-context";
import { clientToApi } from "@/lib/backend/client";

export function UserEditor({
  user: originalUser,
  userLanguage,
  accessToken,
}: {
  user: User;
  userLanguage: Language;
  accessToken: string;
}) {
  const [user, setUser] = useState(originalUser);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [admin, setAdmin] = useState(user.admin);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const { setModalError, setModalInfo } = useModals();
  const data = TRANSLATIONS[userLanguage];

  const haveDetailsChanged = () =>
    username !== user.username || email !== user.email || admin !== user.admin;

  function handleSubmit(evt: FormEvent) {
    evt.preventDefault();
    if (haveDetailsChanged()) {
      const newUser = { email, username, admin };
      updateUser("details", newUser, () => {
        setUser({ ...user, ...newUser });
      });
    }
    if (password) {
      updateUser("password", { newPassword: password }, () => setPassword(""));
    }
  }

  async function updateUser(
    section: "details" | "password",
    body: Record<string, string | boolean>,
    onSuccess: () => void,
  ) {
    setLoading(true);
    const result = await clientToApi(
      `auth/users/${user.uuid}/${section}`,
      accessToken,
      {
        method: "PUT",
        body,
        userLanguage,
        setModalError,
      },
    );
    if (result.ok) {
      setModalInfo(`Successfully updated user '${username}' ${section}.`);
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <form className="form-login gap-10" onSubmit={handleSubmit}>
      <InputBox
        label={data.profile.formDetails.username}
        value={username}
        setValue={setUsername}
      />
      <InputBox
        label={data.profile.formDetails.email}
        value={email}
        setValue={setEmail}
      />
      <InputBox
        type="password"
        required={false}
        label={data.profile.formDetails.password}
        value={password}
        setValue={setPassword}
      />
      <div>
        <InputBox
          type="checkbox"
          required={false}
          label={data.profile.formDetails.administrator}
          value={admin}
          setValue={setAdmin}
        />
      </div>
      <br />
      {loading ? (
        <LoadingButton />
      ) : (
        <button
          className="btn"
          role="submit"
          disabled={!haveDetailsChanged() && !password}
        >
          {data.admin.contentManager.formDetails.update}
        </button>
      )}
    </form>
  );
}

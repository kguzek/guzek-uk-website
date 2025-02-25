"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import type { Language } from "@/lib/enums";
import type { User } from "@/lib/types";
import { InputBox } from "@/components/forms/input-box";
import { LoadingButton } from "@/components/loading/loading-button";
import { clientToApi } from "@/lib/backend/client";
import { useModals } from "@/lib/context/modal-context";
import { TRANSLATIONS } from "@/lib/translations";

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
  const [admin, setAdmin] = useState(user.role === "admin");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const { setModalError, setModalInfo } = useModals();
  const data = TRANSLATIONS[userLanguage];

  const haveDetailsChanged = () =>
    username !== user.username ||
    email !== user.email ||
    admin !== (user.role === "admin");

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
    const result = await clientToApi(`auth/users/${user.id}/${section}`, accessToken, {
      method: "PUT",
      body,
      userLanguage,
      setModalError,
    });
    if (result.ok) {
      setModalInfo(`Successfully updated user '${username}' ${section}.`);
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <form
      action={`https://auth.guzek.uk/auth/users/${user.id}/details`}
      method="POST"
      className="flex w-[50%] flex-col"
      onSubmit={handleSubmit}
    >
      <input className="hidden" type="hidden" name="_method" value="PUT" />
      <InputBox
        label={data.profile.formDetails.username}
        value={username}
        name="username"
        setValue={setUsername}
      />
      <InputBox
        label={data.profile.formDetails.email}
        value={email}
        name="email"
        setValue={setEmail}
      />
      <InputBox
        type="password"
        required={false}
        label={data.profile.formDetails.password}
        value={password}
        setValue={setPassword}
      />
      <InputBox
        label={data.profile.formDetails.serverUrl}
        value={user.serverUrl ?? ""}
        setValue={() => {}}
        disabled
        name="serverUrl"
        required={false}
      />
      <div>
        <InputBox
          type="checkbox"
          required={false}
          label={data.profile.formDetails.administrator}
          value={admin}
          name="admin"
          setValue={setAdmin}
        />
      </div>
      <div className="mb-5 grid w-fit grid-cols-[auto_1fr] gap-2 text-sm">
        {user.created_at && (
          <>
            <p>User created:</p>
            <code className="field">{user.created_at}</code>
          </>
        )}
        {user.modified_at && (
          <>
            <p>Last modified:</p>
            <code className="field">{user.modified_at}</code>
          </>
        )}
      </div>
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

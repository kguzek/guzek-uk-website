"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InputBox from "@/components/forms/input-box";
import LoadingScreen, { LoadingButton } from "@/components/loading-screen";
import { ErrorComponent } from "@/components/error-component";
import { ErrorCode, User } from "@/lib/types";
import { getErrorMessage } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";
import { useModals } from "@/context/modal-context";
import { useFetch } from "@/context/fetch-context";
import { useAdmin } from "@/context/admin-context";

export default function UserPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | undefined>();
  const params = useParams();
  const { users, setUsers, setTitle } = useAdmin();

  useEffect(() => {
    if (!users) return;
    const user = users.find((user) => user.uuid === params?.uuid);
    if (user) {
      setUser(user);
      setTitle("@" + user.username);
    }
    setLoading(false);
  }, [params, users]);

  if (loading)
    return (
      <div className="user-page">
        <LoadingScreen />
      </div>
    );

  if (!user) return <ErrorComponent errorCode={ErrorCode.NotFound} />;

  return (
    <UserEditor
      user={user}
      setUser={(newUser) => {
        setUsers(
          (old) =>
            old &&
            old.map((user) => (user.uuid === newUser.uuid ? newUser : user))
        );
      }}
    />
  );
}

function UserEditor({
  user,
  setUser,
}: {
  user: User;
  setUser: (user: User) => void;
}) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [admin, setAdmin] = useState(user.admin);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const { data } = useTranslations();
  const { setModalError, setModalInfo } = useModals();
  const { fetchFromAPI, removeOldCaches } = useFetch();

  const haveDetailsChanged = () =>
    username !== user.username || email !== user.email || admin !== user.admin;

  function handleSubmit(evt: FormEvent) {
    evt.preventDefault();
    if (haveDetailsChanged()) {
      const newUser = { email, username, admin };
      updateUser("details", newUser, () => {
        removeOldCaches();
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
    onSuccess: () => void
  ) {
    setLoading(true);
    try {
      const res = await fetchFromAPI(`auth/users/${user.uuid}/${section}`, {
        method: "PUT",
        body,
      });
      if (res.ok) {
        setModalInfo(`Successfully updated user '${username}' ${section}.`);
        onSuccess();
      } else {
        const json = await res.json();
        setModalError(getErrorMessage(res, json, data));
      }
    } catch {
      setModalError(data.networkError);
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

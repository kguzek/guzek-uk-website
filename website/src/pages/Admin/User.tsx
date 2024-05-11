import React, { FormEvent, useContext, useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import InputBox from "../../components/Forms/InputBox";
import LoadingScreen, {
  LoadingButton,
} from "../../components/LoadingScreen/LoadingScreen";
import {
  ModalContext,
  TranslationContext,
  useFetchContext,
} from "../../misc/context";
import { ErrorCode, User } from "../../misc/models";
import { getErrorMessage } from "../../misc/util";
import ErrorPage from "../ErrorPage";
import { AdminContext } from "./Base";

export default function UserPage() {
  const { users, setUsers } = useOutletContext<AdminContext>();
  const [user, setUser] = useState<User | undefined>();
  const params = useParams();

  useEffect(() => {
    if (!users) return;
    setUser(users.find((user) => user.uuid === params.uuid));
  }, [params, users]);

  if (!users) return <LoadingScreen />;

  if (!user) return <ErrorPage errorCode={ErrorCode.NotFound} />;

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
  const data = useContext(TranslationContext);
  const { setModalError, setModalInfo } = useContext(ModalContext);
  const { fetchFromAPI, removeOldCaches } = useFetchContext();

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


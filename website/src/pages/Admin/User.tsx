import React, { useContext, useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import InputBox from "../../components/Forms/InputBox";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { TranslationContext } from "../../misc/context";
import { ErrorCode, User } from "../../misc/models";
import ErrorPage from "../ErrorPage";
import { AdminContext } from "./Base";

export default function UserPage() {
  const { users } = useOutletContext<AdminContext>();
  const [user, setUser] = useState<User | undefined>();
  const params = useParams();

  useEffect(() => {
    if (!users) return;

    setUser(users.find((user) => user.uuid === params.uuid));
  }, [params]);

  if (!users) return <LoadingScreen />;

  if (!user) return <ErrorPage errorCode={ErrorCode.NotFound} />;

  return <UserEditor user={user} />;
}

function UserEditor({ user }: { user: User }) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const data = useContext(TranslationContext);
  return (
    <form className="form-editor">
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
    </form>
  );
}


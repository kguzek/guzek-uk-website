import React, { FormEvent, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputBox from "../components/Forms/InputBox";
import { LoadingButton } from "../components/LoadingScreen/LoadingScreen";
import { User } from "../misc/models";
import {
  AuthContext,
  ModalContext,
  TranslationContext,
  useFetchContext,
} from "../misc/context";
import { getErrorMessage } from "../misc/util";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const data = useContext(TranslationContext);

  const { user, setUser } = useContext(AuthContext);
  const { fetchFromAPI } = useFetchContext();
  const { setModalError } = useContext(ModalContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/profile");
  }, [user]);

  useEffect(() => {
    setModalError();
  }, [password, repeatPassword]);

  async function handleSignUp(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    if (password !== repeatPassword) {
      setModalError(data.profile.passwordMismatch);
      return;
    }
    setModalError("");
    setLoading(true);

    const body = {
      username,
      email,
      password,
    };
    const res = await fetchFromAPI("auth/users", { method: "POST", body });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setUser(json as User);
    } else {
      setModalError(getErrorMessage(res, json, data));
    }
  }

  return (
    <div className="flex-column">
      <form className="form-login" onSubmit={handleSignUp}>
        <InputBox
          label={data.profile.formDetails.username}
          type="text"
          value={username}
          name="username"
          setValue={setUsername}
        />
        <InputBox
          label={data.profile.formDetails.email}
          type="email"
          value={email}
          name="email"
          setValue={setEmail}
        />
        <InputBox
          label={data.profile.formDetails.password}
          type="password"
          value={password}
          name="password"
          setValue={setPassword}
        />
        <InputBox
          label={data.profile.formDetails.passwordRepeat}
          type="password"
          value={repeatPassword}
          name="password2"
          setValue={setRepeatPassword}
        />
        {loading ? (
          <LoadingButton />
        ) : (
          <button type="submit" className="btn btn-submit">
            {data.profile.formDetails.signup}
          </button>
        )}
      </form>
      <p>{data.profile.formDetails.haveAccountAlready}</p>
      <Link to="/login">
        <i>{data.profile.formDetails.login}</i>
      </Link>
    </div>
  );
}

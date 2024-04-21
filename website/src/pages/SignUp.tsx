import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchFromAPI } from "../misc/backend";
import InputBox from "../components/Forms/InputBox";
import { LoadingButton } from "../components/LoadingScreen";
import { Translation } from "../misc/translations";
import { User } from "../misc/models";

export default function SignUp({
  data,
  user,
  setUser,
}: {
  data: Translation;
  user: any;
  setUser: Function;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [username, setUsername] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/profile");
  }, [user]);

  useEffect(() => {
    setErrorMessage("");
  }, [password, repeatPassword]);

  async function handleSignUp(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    if (password !== repeatPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setErrorMessage("");
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
      const msg = Object.entries(json).shift() ?? [];
      setErrorMessage(msg.join(": "));
    }
  }

  return (
    <div className="flex-column">
      <form className="form-login" onSubmit={handleSignUp}>
        <InputBox
          label={data.profile.formDetails.username}
          type="text"
          value={username}
          setValue={setUsername}
        />
        <InputBox
          label={data.profile.formDetails.email}
          type="email"
          value={email}
          setValue={setEmail}
        />
        <InputBox
          label={data.profile.formDetails.password}
          type="password"
          value={password}
          setValue={setPassword}
        />
        <InputBox
          label={data.profile.formDetails.passwordRepeat}
          type="password"
          value={repeatPassword}
          setValue={setRepeatPassword}
        />
        {errorMessage && <p className="error-msg">{errorMessage}</p>}
        {loading ? (
          <LoadingButton className="form" color="white" />
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

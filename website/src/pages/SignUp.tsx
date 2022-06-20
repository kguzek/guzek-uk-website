import React, { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InputBox from "../components/Forms/InputBox";
import { LoadingButton } from "../components/LoadingScreen";
import { Translation } from "../translations";

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
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErrorMessage("");
  }, [password, repeatPassword]);

  async function handleSignUp(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    if (password !== repeatPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    for (const func of [
      setName,
      setSurname,
      setEmail,
      setPassword,
      setRepeatPassword,
    ]) {
      func("");
    }
    const data = {
      name,
      surname,
      email,
      password,
    };
    const res = await fetch("https://api.guzek.uk/auth/create-account", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setUser();
    } else {
      const msg = Object.entries(json).shift() ?? [];
      setErrorMessage(msg.join(": "));
    }
  }

  return (
    <div className="login-page">
      <form className="login" onSubmit={handleSignUp}>
        <InputBox label="Name" type="text" value={name} setValue={setName} />
        <InputBox
          label="Surname"
          type="text"
          value={surname}
          setValue={setSurname}
        />
        <InputBox
          label="Email"
          type="email"
          value={email}
          setValue={setEmail}
        />
        <InputBox
          label="Password"
          type="password"
          value={password}
          setValue={setPassword}
        />
        <InputBox
          label="Repeat password"
          type="password"
          value={repeatPassword}
          setValue={setRepeatPassword}
        />
        {errorMessage && <p className="error-msg">{errorMessage}</p>}
        {loading || 1 ? (
          <LoadingButton className="login" color="white" />
        ) : (
          <button type="submit" className="login-btn submit-btn">
            Sign Up
          </button>
        )}
      </form>
      <p>have an account already?</p>
      <Link to="/login" className="signup-btn">
        <i>Log In</i>
      </Link>
    </div>
  );
}

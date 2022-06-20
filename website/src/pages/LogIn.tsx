import React, { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, fetchFromAPI } from "../backend";
import InputBox from "../components/Forms/InputBox";
import LoadingScreen, { LoadingButton } from "../components/LoadingScreen";
import { Translation } from "../translations";

export default function LogIn({
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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setLoading(true);
    for (const func of [setEmail, setPassword]) {
      func("");
    }
    const data = {
      email,
      password,
    };
    const res = await fetchFromAPI("auth/login", "POST", data);
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setUser({ email });
    } else {
      setErrorMessage("Invalid credentials.");
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="login-page">
      <form className="login" onSubmit={handleLogin}>
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
        {errorMessage && <p className="error-msg">{errorMessage}</p>}
        {loading ? (
          <LoadingButton className="login" color="white" />
        ) : (
          <button type="submit" className="login-btn submit-btn">
            Log In
          </button>
        )}
      </form>
      <p>or</p>
      <Link to="/signup" className="signup-btn">
        <i>Sign Up</i>
      </Link>
    </div>
  );
}

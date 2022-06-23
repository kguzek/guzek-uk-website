import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "../App";
import { fetchFromAPI } from "../backend";
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
    // for (const func of [
    //   setName,
    //   setSurname,
    //   setEmail,
    //   setPassword,
    //   setRepeatPassword,
    // ]) {
    //   func("");
    // }
    const fetchData = {
      name,
      surname,
      email,
      password,
    };
    const res = await fetchFromAPI("auth/users", "POST", fetchData);
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
    <div className="login-page">
      <form className="login" onSubmit={handleSignUp}>
        <InputBox
          label={data.formDetails.name}
          type="text"
          value={name}
          setValue={setName}
        />
        <InputBox
          label={data.formDetails.surname}
          type="text"
          value={surname}
          setValue={setSurname}
        />
        <InputBox
          label={data.formDetails.email}
          type="email"
          value={email}
          setValue={setEmail}
        />
        <InputBox
          label={data.formDetails.password}
          type="password"
          value={password}
          setValue={setPassword}
        />
        <InputBox
          label={data.formDetails.passwordRepeat}
          type="password"
          value={repeatPassword}
          setValue={setRepeatPassword}
        />
        {errorMessage && <p className="error-msg">{errorMessage}</p>}
        {loading ? (
          <LoadingButton className="login" color="white" />
        ) : (
          <button type="submit" className="login-btn submit-btn">
            {data.formDetails.signup}
          </button>
        )}
      </form>
      <p>{data.formDetails.haveAccountAlready}</p>
      <Link to="/login" className="signup-btn">
        <i>{data.formDetails.login}</i>
      </Link>
    </div>
  );
}

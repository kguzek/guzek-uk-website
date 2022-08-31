import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchFromAPI, getRequest, updateAccessToken } from "../misc/backend";
import InputBox from "../components/Forms/InputBox";
import LoadingScreen, { LoadingButton } from "../components/LoadingScreen";
import { Translation } from "../misc/translations";
import { User } from "../misc/models";

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
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/profile");
  }, [user]);

  async function handleLogin(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setInvalidCredentials(false);
    setLoading(true);
    for (const func of [setEmail, setPassword]) {
      func("");
    }
    const body = {
      email,
      password,
    };
    const req = getRequest("auth/user", "POST", { body });
    const res = await fetchFromAPI(req);
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      const { accessToken, refreshToken, ...userDetails } = json;
      setUser(userDetails as User);
      updateAccessToken(accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      setInvalidCredentials(true);
    }
  }

  if (loading) {
    return (
      <LoadingScreen className="flex-column" text={data.profile.loading} />
    );
  }

  return (
    <div className="flex-column">
      <form className="form" onSubmit={handleLogin}>
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
        {invalidCredentials && (
          <p className="error-msg">{data.profile.invalidCredentials}</p>
        )}
        {loading ? (
          <LoadingButton className="form" color="white" />
        ) : (
          <button type="submit" className="btn btn-submit">
            {data.profile.formDetails.login}
          </button>
        )}
      </form>
      <p>{data.profile.formDetails.or}</p>
      <Link to="/signup">
        <i>{data.profile.formDetails.signup}</i>
      </Link>
    </div>
  );
}

import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchFromAPI, updateAccessToken } from "../misc/backend";
import InputBox from "../components/Forms/InputBox";
import LoadingScreen, { LoadingButton } from "../components/LoadingScreen";
import { Translation } from "../misc/translations";
import { StateSetter, User } from "../misc/models";
import Modal from "../components/Modal";

export default function LogIn({
  data,
  user,
  logout,
  setUser,
}: {
  data: Translation;
  user: any;
  logout: () => void;
  setUser: StateSetter<User | null>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/profile");
  }, [user]);

  async function handleLogin(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setModalVisible(false);
    setLoading(true);
    const body = {
      email,
      password,
    };
    const res = await fetchFromAPI(
      "auth/user",
      { method: "POST", body },
      logout
    );
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      const { accessToken, refreshToken, ...userDetails } = json;
      setUser(userDetails as User);
      updateAccessToken(accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      setModalVisible(true);
    }
  }

  return (
    <>
      <Modal
        className="error"
        message={data.profile.invalidCredentials}
        visible={modalVisible}
        onClick={() => setModalVisible(false)}
      />
      {user ? (
        <LoadingScreen className="flex-column" text={data.profile.loading} />
      ) : (
        <>
          <form className="form-login" onSubmit={handleLogin}>
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
            {loading ? (
              <LoadingButton />
            ) : (
              <button type="submit" className="btn btn-submit">
                {data.profile.formDetails.login}
              </button>
            )}
          </form>
          <div className="centred">
            <p>{data.profile.formDetails.or}</p>
            <Link to="/signup">
              <i>{data.profile.formDetails.signup}</i>
            </Link>
          </div>
        </>
      )}
    </>
  );
}

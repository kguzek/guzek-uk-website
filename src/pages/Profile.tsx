import { MouseEvent, useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { clearStoredLoginInfo } from "../misc/backend";
import {
  AuthContext,
  ModalContext,
  TranslationContext,
  useFetchContext,
} from "../misc/context";
import { getErrorMessage, setTitle } from "../misc/util";
import InputBox from "../components/Forms/InputBox";

function Profile() {
  const data = useContext(TranslationContext);
  const { user, logout, setUser } = useContext(AuthContext);
  const { fetchFromAPI } = useFetchContext();
  const [serverUrl, setServerUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const { setModalError, setModalInfo } = useContext(ModalContext);

  useEffect(() => {
    setTitle(data.profile.title);
  }, [data]);

  async function handleLogOut(_evt: MouseEvent<HTMLButtonElement>) {
    const token = localStorage.getItem("refreshToken");
    await fetchFromAPI(`auth/tokens/${token}`, { method: "DELETE" });
    clearStoredLoginInfo();
    logout();
  }

  useEffect(() => {
    if (!user) return;
    setServerUrl(user.serverUrl ?? "");
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace={true} />;
  }

  const isServerUrlValid = () =>
    !updating &&
    serverUrl &&
    serverUrl !== "" &&
    serverUrl !== (user.serverUrl ?? "") &&
    serverUrl.match(/^https?:\/\/.+/);

  async function handleUpdateServerUrl(evt: MouseEvent<HTMLButtonElement>) {
    evt.preventDefault();
    if (!user) return;
    setUpdating(true);
    const newServerUrl = serverUrl.endsWith("/") ? serverUrl : serverUrl + "/";
    const res = await fetchFromAPI(`auth/users/${user.uuid}/details`, {
      method: "PUT",
      body: { serverUrl: newServerUrl },
    });
    const json = await res.json();
    if (res.ok) {
      setServerUrl(json.serverUrl);
      setModalInfo(data.profile.serverUrlUpdated(newServerUrl));
      const newUser = { ...user, serverUrl: newServerUrl };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      setModalError(getErrorMessage(res, json, data));
    }
    setUpdating(false);
  }

  const userCreatedAt = new Date(user.created_at);
  return (
    <div className="text">
      <h3>{data.profile.body}</h3>
      <p>
        {data.profile.formDetails.type}:{" "}
        {data.profile.formDetails[user.admin ? "administrator" : "regularUser"]}
      </p>
      <p>
        {data.profile.formDetails.username}: "{user.username}"
      </p>
      <p>
        {data.profile.formDetails.email}: "{user.email}"
      </p>
      <form className="flex gap-10">
        <div style={{ width: "100%" }}>
          <InputBox
            label={data.profile.formDetails.serverUrl}
            value={serverUrl}
            setValue={setServerUrl}
            required={false}
            info={
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "help",
                }}
                onClick={(evt) => {
                  evt.preventDefault();
                  setModalInfo(data.liveSeries.explanation);
                }}
              >
                <i className="whats-this">{data.liveSeries.whatsThis}</i>
              </button>
            }
          />
        </div>
        <button
          role="submit"
          className="btn"
          disabled={!isServerUrlValid()}
          style={{ alignSelf: "flex-end" }}
          onClick={handleUpdateServerUrl}
        >
          {data.admin.contentManager.formDetails.update}
        </button>
      </form>
      <p>
        <small>
          UUID: <code>{user.uuid}</code>
        </small>
        <br />
        <small>
          {data.profile.formDetails.creationDate}:{" "}
          <code>{data.dateTimeFormat.format(userCreatedAt)}</code>
        </small>
      </p>
      <div className="centred">
        <button className="btn btn-submit" onClick={handleLogOut}>
          {data.profile.formDetails.logout}
        </button>
      </div>
    </div>
  );
}

export default Profile;

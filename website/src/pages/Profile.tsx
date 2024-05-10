import React, { MouseEvent, useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { clearStoredLoginInfo } from "../misc/backend";
import {
  AuthContext,
  TranslationContext,
  useFetchContext,
} from "../misc/context";
import { setTitle } from "../misc/util";

function Profile() {
  const data = useContext(TranslationContext);
  const { user, logout } = useContext(AuthContext);
  const { fetchFromAPI } = useFetchContext();

  useEffect(() => {
    setTitle(data.profile.title);
  }, [data]);

  async function handleLogOut(_evt: MouseEvent<HTMLButtonElement>) {
    const token = localStorage.getItem("refreshToken");
    await fetchFromAPI("auth/token", {
      method: "DELETE",
      body: { token },
    });
    clearStoredLoginInfo();
    logout();
  }

  if (!user) {
    return <Navigate to="/login" replace={true} />;
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
      <small>
        UUID: <code>{user.uuid}</code>
      </small>
      <br />
      <small>
        {data.profile.formDetails.creationDate}:{" "}
        <code>{data.dateTimeFormat.format(userCreatedAt)}</code>
      </small>
      <div className="centred">
        <button className="btn btn-submit" onClick={handleLogOut}>
          {data.profile.formDetails.logout}
        </button>
      </div>
    </div>
  );
}

export default Profile;

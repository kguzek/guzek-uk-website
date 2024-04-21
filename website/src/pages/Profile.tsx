import React, { MouseEvent, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { fetchFromAPI } from "../misc/backend";
import { User } from "../misc/models";
import { Translation } from "../misc/translations";
import { setTitle } from "../misc/util";

function Profile({
  data,
  user,
  setUser,
}: {
  data: Translation;
  user: User | null;
  setUser: Function;
}) {
  async function handleLogOut(_evt: MouseEvent<HTMLButtonElement>) {
    const token = localStorage.getItem("refreshToken");
    await fetchFromAPI("auth/token", {
      method: "DELETE",
      body: { token },
    });
    localStorage.removeItem("user");
    localStorage.removeItem("accessTokenInfo");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }

  useEffect(() => {
    setTitle(data.profile.title);
  }, [data]);

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
        <code>{userCreatedAt.toLocaleString()}</code>
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

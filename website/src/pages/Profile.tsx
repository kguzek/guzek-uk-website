import React, { MouseEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchFromAPI } from "../backend";
import { Translation } from "../translations";
import { setTitle } from "../util";

function Profile({
  data,
  user,
  setUser,
}: {
  data: Translation;
  user: any;
  setUser: Function;
}) {
  async function handleLogOut(_evt: MouseEvent<HTMLButtonElement>) {
    const token = localStorage.getItem("refreshToken");
    await fetchFromAPI("auth/token", "DELETE", { token });
    localStorage.removeItem("user");
    localStorage.removeItem("accessTokenInfo");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }

  useEffect(() => {
    setTitle(data.profile.title);
  }, [data]);

  if (!user) {
    return (
      <div className="login">
        <Link to="/login" className="login-btn">
          {data.formDetails.login}
        </Link>
      </div>
    );
  }
  const userCreatedAt = new Date(user.created_at);
  return (
    <div className="text">
      <p>{data.profile.body}</p>
      <p>
        {data.formDetails.name}, {data.formDetails.surname}: {user.name}{" "}
        {user.surname}
      </p>
      <p>
        {data.formDetails.email}: {user.email}
      </p>
      <small>Account unique ID: {user.uuid}</small>
      <br />
      <small>Account created on {userCreatedAt.toString()}</small>
      <div className="login-page">
        <button className="login-btn submit-btn" onClick={handleLogOut}>
          {data.formDetails.logout}
        </button>
      </div>
    </div>
  );
}

export default Profile;

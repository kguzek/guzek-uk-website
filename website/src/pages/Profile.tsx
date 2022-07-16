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
      <div className="form">
        <Link to="/login" className="btn">
          {data.profile.formDetails.login}
        </Link>
      </div>
    );
  }
  const userCreatedAt = new Date(user.created_at);
  return (
    <div className="text">
      <p>{data.profile.body}</p>
      <p>Administrator: {user.admin.toString()}</p>
      <p>
        {data.profile.formDetails.name}: {user.name}
        <br />
        {data.profile.formDetails.surname}: {user.surname}
      </p>
      <p>
        {data.profile.formDetails.email}: {user.email}
      </p>
      <small>
        Unique user ID: <span>{user.uuid}</span>
      </small>
      <br />
      <small>Account created on {userCreatedAt.toString()}</small>
      <div className="form">
        <button className="btn btn-submit" onClick={handleLogOut}>
          {data.profile.formDetails.logout}
        </button>
      </div>
    </div>
  );
}

export default Profile;

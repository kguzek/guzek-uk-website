import React, { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Translation } from "../translations";

function Profile({
  data,
  user,
  setUser,
}: {
  data: Translation;
  user: any;
  setUser: Function;
}) {
  function handleLogOut(evt: MouseEvent<HTMLButtonElement>) {
    setUser(null);
    localStorage.removeItem("user");
  }

  if (!user) {
    return (
      <div className="login">
        <Link to="/login" className="login-btn">
          {data.formDetails.login}
        </Link>
      </div>
    );
  }
  return (
    <div className="text">
      <p>{data.profile.body}</p>
      <div className="login-page">
        <button className="login-btn submit-btn" onClick={handleLogOut}>
          {data.formDetails.logout}
        </button>
      </div>
    </div>
  );
}

export default Profile;

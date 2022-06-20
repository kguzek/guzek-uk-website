import React from "react";
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
  if (!user) {
    return <LogInButton />;
  }
  return (
    <div className="text">
      <p>Your Profile</p>
    </div>
  );
}

function LogInButton() {
  return (
    <div className="login">
      <Link to="/login" className="login-btn">
        Log In
      </Link>
    </div>
  );
}

export default Profile;

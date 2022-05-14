import React from "react";
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
    return (
      <div className="centred">
        <button>Log In</button>
      </div>
    );
  }
  return (
    <div className="text">
      <p>Your Profile</p>
    </div>
  );
}

export default Profile;

import React from "react";
import PropTypes from "prop-types";
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

Profile.propTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object,
  setUser: PropTypes.func.isRequired,
};

export default Profile;

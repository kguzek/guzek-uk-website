import React from "react";
import PropTypes from "prop-types";

function Profile({ data, user, setUser }) {
	if (!user) {
		return <div className="centred">
			<button>Log In</button>
		</div>
	}
  return (
    <div className="text">
      <p>Your Profile</p>
    </div>
  );
}

Profile.propTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes,
  setUser: PropTypes.func.isRequired,
};

export default Profile;

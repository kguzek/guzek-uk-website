import React, { useEffect } from "react";
import PropTypes from "prop-types";

function NotFound({ data }) {
  useEffect(() => {
    document.title = data.title404;
  }, [data.title404])
  return (
    <div className="text">
      <p>{data.body404}</p>
    </div>
  );
}

NotFound.propTypes = {
	data: PropTypes.object,
};

export default NotFound;

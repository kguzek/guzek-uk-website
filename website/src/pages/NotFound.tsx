import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Translation } from "../translations";

function NotFound({ data }: { data: Translation }) {
  useEffect(() => {
    document.title = data.title404;
  }, [data]);

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

import React, { useEffect } from "react";
import PropTypes from "prop-types";

function Konrad({ data }) {
  useEffect(() => {
    document.title = data.title;
  }, [data.title]);

  return (
    <div className="text">
      <p>{data.bodyKonrad}</p>
    </div>
  );
}

Konrad.propTypes = {
  data: PropTypes.object,
};

export default Konrad;

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Translation } from "../translations";

function Konrad({ data }: { data: Translation }) {
  useEffect(() => {
    document.title = data.title;
  }, [data]);

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

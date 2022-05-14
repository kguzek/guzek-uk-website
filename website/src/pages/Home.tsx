import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Translation } from "../translations";

function Home({ data }: { data: Translation }) {
  useEffect(() => {
    document.title = data.title;
  }, [data]);

  return (
    <div className="text">
      <p>{data.bodyHome}</p>
    </div>
  );
}

Home.propTypes = {
  data: PropTypes.object,
};

export default Home;

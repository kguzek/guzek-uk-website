import React, { useEffect } from "react";
import PropTypes from "prop-types";

function Home({ data }) {
  useEffect(() => {
    document.title = data.title;
  }, [data.title])
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

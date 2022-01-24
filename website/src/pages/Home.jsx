import React, { useEffect } from "react";
import PropTypes from "prop-types";

const HOMEPAGE_URL = "https://www.guzek.uk/";

function Home({ data }) {
  useEffect(() => {
    document.title = data.title;
  }, [data.title]);
  window.location.toString() === HOMEPAGE_URL || (window.location = HOMEPAGE_URL);
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

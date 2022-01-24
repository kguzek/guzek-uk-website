import React from "react";
import PropTypes from "prop-types";
import favicon from "./favicon.ico";

function Logo({ size = 80 }) {
  return (
    <a href={"https://www.guzek.uk/"}>
      <img src={favicon} width={size} height={size} alt="Guzek UK Logo" />
    </a>
  );
}

Logo.propTypes = {
  size: PropTypes.number,
};

export default Logo;

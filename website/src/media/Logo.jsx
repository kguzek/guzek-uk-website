import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import favicon from "./favicon.ico";

function Logo({ size = 80, isLink = true }) {
  return (
    <Link to={isLink ? "/" : "#"}>
      <img src={favicon} width={size} height={size} alt="Guzek UK Logo" />
    </Link>
  );
}

Logo.propTypes = {
  size: PropTypes.number,
};

export default Logo;

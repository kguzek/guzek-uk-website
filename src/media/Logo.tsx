import React from "react";
import { Link } from "react-router-dom";
import logo from "./logo128.png";

function Logo({ size = 80 }) {
  return (
    <Link to={"/"}>
      <img src={logo} width={size} height={size} alt="Guzek UK Logo" />
    </Link>
  );
}

export default Logo;

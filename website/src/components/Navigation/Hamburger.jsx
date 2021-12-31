import React from "react";
import PropTypes from "prop-types";

function Hamburger({ menuOpen, toggleMenu }) {
  return (
    <div onClick={toggleMenu} className="hamburger">
      <p className={menuOpen ? "fas fa-times" : "fas fa-bars"}></p>
    </div>
  );
}

Hamburger.propTypes = {
  toggleMenu: PropTypes.func,
};

export default Hamburger;

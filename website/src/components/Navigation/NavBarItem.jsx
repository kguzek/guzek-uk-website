import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

function NavBarItem({ item, onClick }) {
  // check if the active page name is provided
  const path = window.location.pathname;
  const isActive = item.url === "/" ? path === "/" : path.startsWith(item.url);
  return (
    <Link
      to={item.url}
      onClick={onClick}
      className={"nav-link" + (isActive ? " active" : "")}
    >
      {item.title}
    </Link>
  );
}

NavBarItem.propTypes = {
  item: PropTypes.object,
  onClick: PropTypes.func,
  activePage: PropTypes.string,
};

export default NavBarItem;

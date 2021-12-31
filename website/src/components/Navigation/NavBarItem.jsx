import React from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

function NavBarItem({ item, onClick }) {
	const path = useLocation().pathname;
  return (
    <Link
      to={item.url}
      onClick={onClick}
      className={item.className + (path === item.url ? " active" : "")}
    >
      {item.title}
    </Link>
  );
}

NavBarItem.propTypes = {
  item: PropTypes.object,
  onClick: PropTypes.func,
};

export default NavBarItem;

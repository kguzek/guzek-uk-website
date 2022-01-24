import React from "react";
import PropTypes from "prop-types";

function NavBarItem({ item, onClick, activePage }) {
  // check if the active page name is provided
  const isActive = activePage
    ? item.pageName === activePage
    : window.location.pathname === item.url;
  return (
    <a
      href={item.url}
      onClick={onClick}
      className={item.className + (isActive ? " active" : "")}
    >
      {item.title}
    </a>
  );
}

NavBarItem.propTypes = {
  item: PropTypes.object,
  onClick: PropTypes.func,
  activePage: PropTypes.string,
};

export default NavBarItem;

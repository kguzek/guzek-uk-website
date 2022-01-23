import React from "react";
import PropTypes from "prop-types";

function NavBarItem({ item, onClick, activePage }) {
  const url = `http://${item.url}`
  // check if the active page name is provided
  const isActive = activePage
    ? item.pageName === activePage
    : window.location.toString().startsWith(url);
  return (
    <a
      href={url}
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

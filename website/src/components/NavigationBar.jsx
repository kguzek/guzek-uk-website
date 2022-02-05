import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Logo from "../media/Logo";
import Translations from "../translations";
import "../styles/navigation.css";

function NavigationBar({
  data,
  user,
  selectedLanguage,
  changeLang,
  menuItems,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const winDims = useWindowDimensions();

  // don't render items that are set as 'hidden' in the nav bar
  const visibleItems = (menuItems || []).filter((item) => !item.hidden);

  // create the array of nav bar page elements
  const menuItemElements = visibleItems.map((item, index) => (
    <li key={index}>
      <NavBarItem item={item} setMenuOpen={setMenuOpen} />
    </li>
  ));

  const displayStyle =
    winDims.width > 800 ? "desktop" : winDims.width > 550 ? "medium" : "mobile";
  const userWidget = (
    <UserWidget
      data={data}
      user={user}
      displayStyle={displayStyle}
      setMenuOpen={setMenuOpen}
    />
  );

  return (
    <div className="ribbon">
      <nav className="navigation">
        <Logo size={80} />
        <h1>{data.header}</h1>
        <ul className={`${menuOpen ? "open" : "closed"} no-select nav-items `}>
          {displayStyle === "mobile" && userWidget}
          {menuItemElements}
          <LangSelector
            selectedLanguage={selectedLanguage}
            changeLang={changeLang}
          />
          {displayStyle === "desktop" && userWidget}
        </ul>
        {displayStyle === "medium" && userWidget}
        <Hamburger menuOpen={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
      </nav>
      <hr />
    </div>
  );
}

function NavBarItem({ item, setMenuOpen }) {
  // check if the active page name is provided
  const path = window.location.pathname;
  // handle edge case for index page ("/")
  const isActive = item.url === "/" ? path === "/" : path.startsWith(item.url);
  return (
    <Link
      to={item.url}
      onClick={() => setMenuOpen(false)}
      className={"clickable nav-link" + (isActive ? " active" : "")}
    >
      {item.title}
    </Link>
  );
}

function LangSelector({ selectedLanguage, changeLang }) {
  const data = Translations[selectedLanguage];
  return (
    <div className="centred lang-selector">
      {Object.keys(Translations).map((lang) => (
        <button
          key={lang}
          onClick={changeLang}
          className={selectedLanguage === lang ? "active" : "clickable"}
        >
          {lang}
        </button>
      ))}
      <small>{data.language}</small>
    </div>
  );
}

function UserWidget({ data, user, displayStyle, setMenuOpen }) {
  const imgUrl =
    (user && user.url) ||
    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png";
  const active = window.location.pathname.startsWith("/profile")
    ? "active"
    : "";
  return (
    <Link
      to="/profile"
      className={`${active} clickable ${displayStyle} nav-link user-widget`}
      onClick={() => setMenuOpen(false)}
    >
      <img alt="User avatar" className="user-avatar" src={imgUrl} />
      <b className={"user-name"}>{(user && user.name) || data.guest}</b>
    </Link>
  );
}

function Hamburger({ menuOpen, onClick }) {
  return (
    <div onClick={onClick} className="hamburger">
      <p className={menuOpen ? "fas fa-times" : "fas fa-bars"}></p>
    </div>
  );
}

NavigationBar.propTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object,
  selectedLanguage: PropTypes.string.isRequired,
  changeLang: PropTypes.func.isRequired,
  menuItems: PropTypes.array,
};

NavBarItem.propTypes = {
  item: PropTypes.object.isRequired,
  setMenuOpen: PropTypes.func.isRequired,
};

LangSelector.propTypes = {
  selectedLanguage: PropTypes.string.isRequired,
  changeLang: PropTypes.func.isRequired,
};

UserWidget.propTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object,
  dispayStyle: PropTypes.oneOf(["desktop", "medium", "mobile"]),
  setMenuOpen: PropTypes.func.isRequired,
};

Hamburger.propTypes = {
  menuOpen: PropTypes.bool,
  onClick: PropTypes.func,
};

function useWindowDimensions() {
  function getWindowDimensions() {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export default NavigationBar;

import React, { useState, useEffect, MouseEventHandler } from "react";
import { Link } from "react-router-dom";
import Logo from "../media/Logo";
import TRANSLATIONS, { Translation } from "../translations";
import "../styles/navigation.css";
import { Language, MenuItem, User } from "../models";
import { PAGE_NAME } from "../util";

function NavigationBar({
  data,
  user,
  selectedLanguage,
  changeLang,
  menuItems,
}: {
  data: Translation;
  user: User | null;
  selectedLanguage: Language;
  changeLang: MouseEventHandler<HTMLButtonElement>;
  menuItems: MenuItem[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const winDims = useWindowDimensions();

  // Create the array of nav bar page elements
  const menuItemElements = menuItems.map((item, index) => (
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
        <h1>{PAGE_NAME}</h1>
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

function NavBarItem({
  item,
  setMenuOpen,
}: {
  item: MenuItem;
  setMenuOpen: Function;
}) {
  // Check if the active page name is provided
  const path = window.location.pathname;
  // Handle edge case for index page ("/")
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

function LangSelector({
  selectedLanguage,
  changeLang,
}: {
  selectedLanguage: Language;
  changeLang: MouseEventHandler<HTMLButtonElement>;
}) {
  const data = TRANSLATIONS[selectedLanguage];
  return (
    <div className="centred lang-selector">
      {Object.keys(TRANSLATIONS).map((lang) => (
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

function UserWidget({
  data,
  user,
  displayStyle,
  setMenuOpen,
}: {
  data: Translation;
  user: any;
  displayStyle: string;
  setMenuOpen: Function;
}) {
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

function Hamburger({
  menuOpen,
  onClick,
}: {
  menuOpen: boolean;
  onClick: MouseEventHandler;
}) {
  return (
    <div onClick={onClick} className="hamburger">
      <p className={menuOpen ? "fas fa-times" : "fas fa-bars"}></p>
    </div>
  );
}

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

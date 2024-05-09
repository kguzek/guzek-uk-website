import React, {
  useState,
  useEffect,
  MouseEventHandler,
  useContext,
} from "react";
import { Link } from "react-router-dom";
import Logo from "../../media/Logo";
import {
  TRANSLATIONS,
  Translation,
  TranslationContext,
} from "../../misc/translations";
import { Language, MenuItem, User } from "../../misc/models";
import { PAGE_NAME } from "../../misc/util";
import "./Navigation.css";

function NavigationBar({
  user,
  selectedLanguage,
  changeLang,
  menuItems,
}: {
  user: User | null;
  selectedLanguage: Language;
  changeLang: MouseEventHandler<HTMLButtonElement>;
  menuItems: MenuItem[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const winDims = useWindowDimensions();
  const data = useContext<Translation>(TranslationContext);

  // Create the array of nav bar page elements
  const menuItemElements = menuItems.map((item, index) => (
    <li key={index}>
      <NavBarItem item={item} setMenuOpen={setMenuOpen} />
    </li>
  ));

  const displayStyle =
    winDims.width > 980 ? "desktop" : winDims.width > 550 ? "medium" : "mobile";

  const userWidget = (
    <UserWidget
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
  const onClick = () => setMenuOpen(false);
  const className = "clickable nav-link" + (isActive ? " active" : "");
  return item.localUrl ? (
    <Link to={item.url} onClick={onClick} className={className}>
      {item.title}
    </Link>
  ) : (
    <a href={item.url} onClick={onClick} className={className}>
      {item.title}
    </a>
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
  user,
  displayStyle,
  setMenuOpen,
}: {
  user: any;
  displayStyle: string;
  setMenuOpen: Function;
}) {
  const data = useContext<Translation>(TranslationContext);
  const imgUrl =
    (user && user.url) ||
    "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png";
  const active = ["/profile", "/login"].includes(window.location.pathname)
    ? "active"
    : "";
  return (
    <Link
      to="/profile"
      className={`${active} clickable ${displayStyle} nav-link user-widget`}
      onClick={() => setMenuOpen(false)}
    >
      <img alt="User avatar" className="user-avatar" src={imgUrl} />
      <b className={"user-name"}>{user?.username || data.loginShort}</b>
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

interface Page {
  link: string;
  label: string;
}

export function MiniNavBar({
  pathBase,
  pages,
}: {
  pathBase: string;
  pages: Page[];
}) {
  const getClassName = (path: string) =>
    (
      path
        ? location.pathname.startsWith(`/${pathBase}/` + path)
        : [`/${pathBase}`, `/${pathBase}/`].includes(location.pathname)
    )
      ? " active"
      : "";

  return (
    <nav className="flex mini-navbar serif">
      {pages.map(({ link, label }, idx) => (
        <Link
          key={idx}
          className={"clickable nav-link" + getClassName(link)}
          to={link}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

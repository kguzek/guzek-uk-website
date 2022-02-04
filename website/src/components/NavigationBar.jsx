import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Logo from "../media/Logo";
import Translations from "../translations";
import "../styles/navigation.css";
import { fetchFromAPI } from "../backend";

function NavigationBar({ data, selectedLanguage, changeLang, pageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState(null);

  useEffect(() => {
    if (menuItems) {
      return;
    }
    fetchFromAPI("pages").then(
        (res) => res.ok && res.json().then(setMenuItems),
        (error) => console.log("Error fetching menu items.", error)
      );
  }, []);

  return (
    <div className="ribbon">
      <nav className="navigation">
        <Logo size={80} />
        <h1>{data.header}</h1>
        <ul className={"nav-items " + (menuOpen ? "open" : "closed")}>
          {(menuItems || []).map((item, index) => {
            return (
              <li key={index}>
                <NavBarItem
                  item={item}
                  onClick={() => setMenuOpen(false)}
                  activePage={pageName}
                />
              </li>
            );
          })}
          <LangSelector
            selectedLanguage={selectedLanguage}
            changeLang={changeLang}
          />
        </ul>
        <Hamburger menuOpen={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
      </nav>
      <hr />
    </div>
  );
}

NavigationBar.propTypes = {
  data: PropTypes.object,
  selectedLanguage: PropTypes.string,
  changeLang: PropTypes.func,
  pageName: PropTypes.string,
};

function NavBarItem({ item, onClick }) {
  if (item.hidden) {
    return null;
  }

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

function LangSelector({ selectedLanguage, changeLang }) {
  const data = Translations[selectedLanguage];
  return (
    <div className="centred langSelector">
      {Object.keys(Translations).map((lang) => (
        <button
          key={lang}
          onClick={changeLang}
          className={selectedLanguage === lang ? "active" : null}
        >
          {lang}
        </button>
      ))}
      <small>{data.language}</small>
    </div>
  );
}

LangSelector.propTypes = {
  selectedLanguage: PropTypes.string,
  changeLang: PropTypes.func,
};

function Hamburger({ menuOpen, onClick }) {
  return (
    <div onClick={onClick} className="hamburger">
      <p className={menuOpen ? "fas fa-times" : "fas fa-bars"}></p>
    </div>
  );
}

Hamburger.propTypes = {
  onClick: PropTypes.func,
};

export default NavigationBar;

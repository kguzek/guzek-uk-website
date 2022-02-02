import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Logo from "../../media/Logo";
import MenuItems from "./NavBarItems";
import NavBarItem from "./NavBarItem";
import LangSelector from "./LangSelector";
import Hamburger from "./Hamburger";
import "../../styles/navigation.css";

function NavigationBar({ data, selectedLanguage, changeLang, pageName }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMenu(_) {
    setMenuOpen(!menuOpen);
  }

  useEffect(() => {}, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="ribbon">
      <nav className="navigation">
        <Logo size={80} />
        <h1>{data.header}</h1>
        <ul className={"nav-items " + (menuOpen ? "open" : "closed")}>
          {MenuItems.map((item, index) => {
            return (
              <li key={index}>
                <NavBarItem
                  item={item}
                  onClick={closeMenu}
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
        <Hamburger menuOpen={menuOpen} toggleMenu={toggleMenu} />
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

export default NavigationBar;

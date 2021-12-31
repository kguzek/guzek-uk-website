import React from "react";
import PropTypes from "prop-types";
import Translations from "../../Translations";

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
      <br />
      <small>{data.language}</small>
    </div>
  );
}

LangSelector.propTypes = {
  selectedLanguage: PropTypes.string,
  changeLang: PropTypes.func,
};

export default LangSelector;

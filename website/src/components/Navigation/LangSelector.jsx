import React from "react";
import PropTypes from "prop-types";
import Translations from "../../Translations";

function LangSelector({ selectedLanguage, changeLang }) {
  const data = Translations[selectedLanguage];
  return (
    <div className="centred langSelector">
      <div className="langOptions">
        {Object.keys(Translations).map((lang) => (
          <button
            key={lang}
            onClick={changeLang}
            className={selectedLanguage === lang ? "active" : null}
          >
            {lang}
          </button>
        ))}
      </div>
      <small>{data.language}</small>
    </div>
  );
}

LangSelector.propTypes = {
  selectedLanguage: PropTypes.string,
  changeLang: PropTypes.func,
};

export default LangSelector;

import React from "react";
import PropTypes from "prop-types";
import Logo from "../media/Logo";
import "../styles/footer.css";

function Footer({ data }) {
  const copyrightSymbol = "\u00a9";
  return (
    <footer className="centred">
      <hr />
      <Logo size={20} />
      <small>
        {copyrightSymbol} {data.footer.replace("{YEAR}", new Date().getFullYear())}
      </small>
    </footer>
  );
}

Footer.propTypes = {
	data: PropTypes.object,
};

export default Footer;

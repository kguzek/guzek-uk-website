import React, { useContext } from "react";
import Logo from "../../media/Logo";
import { TranslationContext } from "../../misc/context";
import "./Footer.css";

function Footer() {
  const data = useContext(TranslationContext);
  return (
    <footer className="centred">
      <hr />
      <Logo size={20} />
      <small>
        <a
          className="hover-underline"
          href="https://github.com/kguzek"
          target="_blank"
        >
          {data.footer(new Date().getFullYear().toString())}
        </a>
      </small>
      <small>Player v2 (beta)</small>
    </footer>
  );
}

export default Footer;

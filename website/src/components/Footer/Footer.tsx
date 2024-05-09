import React, { useContext } from "react";
import Logo from "../../media/Logo";
import { Translation, TranslationContext } from "../../misc/translations";
import "./Footer.css";

function Footer() {
  const data = useContext<Translation>(TranslationContext);
  return (
    <footer className="centred">
      <hr />
      <Logo size={20} />
      <small>
        {data.footer.replace("{YEAR}", new Date().getFullYear().toString())}
      </small>
    </footer>
  );
}

export default Footer;

import React from "react";
import Logo from "../media/Logo";
import "../styles/footer.css";
import { Translation } from "../translations";

function Footer({ data }: { data: Translation }) {
  const copyrightSymbol = "\u00a9";
  return (
    <footer className="centred">
      <hr />
      <Logo size={20} />
      <small>
        {copyrightSymbol}{" "}
        {data.footer.replace("{YEAR}", new Date().getFullYear().toString())}
      </small>
    </footer>
  );
}

export default Footer;

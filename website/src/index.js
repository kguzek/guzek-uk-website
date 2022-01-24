import React from "react";
import ReactDOM from "react-dom";
import { CookiesProvider } from "react-cookie";
import App from "./App";

const rootElement = document.getElementById("root");

ReactDOM.render(
  <CookiesProvider>
    <App />
  </CookiesProvider>,
  rootElement
);

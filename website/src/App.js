import { useState, useEffect } from "react";
import { Routes, Route, useSearchParams, useNavigate } from "react-router-dom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "./styles/styles.css";
import Translations from "./Translations";
import NavigationBar from "./components/Navigation/NavigationBar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import Konrad from "./pages/Konrad";
import NotFound from "./pages/NotFound";

function App() {
  const [userLanguage, setUserLanguage] = useState("EN");
  const [searchParams, setSearchParams] = useSearchParams({});

  function removeLanguageParam() {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("lang");
    setSearchParams(newSearchParams);
  }

  useEffect(() => {
    // check if the subdomain is anything other than www
    const host = window.location.host;
    if (!host.startsWith("www")) {
      // redirects abc.domain.tld/foo -> www.domain.tld/abc/foo
      const domain = host.includes(":") ? "localhost:3000" : "guzek.uk";
      let subdomain = host.split(domain, 1)[0];
      subdomain && // prepend a forward slash and remove the trailing dot
        (subdomain = "/" + subdomain.substring(0, subdomain.length - 1));
      const path = subdomain + window.location.pathname;
      // prepend the original subdomain as the root subdirectory
      const newLocation = `${window.location.protocol}//www.${domain}${path}`;
      window.location = newLocation;
      return;
    }

    // check if the URL contains the lang parameter
    const lang = searchParams.get("lang");
    if (lang) {
      // it does; clear the lang parameter
      removeLanguageParam();
      const newPageContent = Translations[lang];
      if (newPageContent) {
        // set the page content to the translations corresponding to the lang parameter
        return setUserLanguage(lang);
      }
    }

    // the search parameter language was invalid or not set
    AsyncStorage.getItem("userLanguage").then((lang) => {
      console.log("Got language from storage:", lang);
      if (lang && lang !== "undefined") {
        setUserLanguage(lang);
      }
    }, console.log);
  }, []);

  useEffect(() => {
    // update user language preferences so they are saved on refresh
    AsyncStorage.setItem("userLanguage", userLanguage).then();
  }, [userLanguage]);

  /** Event handler for when the user selects one of the lanugage options. */
  function changeLang(e) {
    e.preventDefault();
    // get the button text and remove whitespaces as well as Non-Breaking Spaces (&nbsp;)
    const elemText = e.target.textContent || e.target.innerText;
    const lang = elemText.replace(/[\s\u00A0]/, "");
    if (Translations[lang]) {
      setUserLanguage(lang);
    }
  }

  const pageContent = Translations[userLanguage];
  // I don't know if this is possible but better to have a failsafe
  if (!pageContent) {
    return (
      <div className="centred">
        <p>"Loading Guzek UK..."</p>
      </div>
    );
  }
  return (
    <div className="App">
      <NavigationBar
        data={pageContent}
        selectedLanguage={userLanguage}
        changeLang={changeLang}
      />
      <Routes>
        <Route path="/" element={<Home data={pageContent} />} />
        <Route path="konrad" element={<Konrad data={pageContent} />} />
        <Route path="*" element={<NotFound data={pageContent} />} />
      </Routes>
      <Footer data={pageContent} />
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "./styles/styles.css";
import Translations from "./translations";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Konrad from "./pages/Konrad";
import NotFound from "./pages/NotFound";
import { fetchFromAPI } from "./backend";
import Profile from "./pages/Profile";

function App() {
  const [userLanguage, setUserLanguage] = useState("EN");
  const [currentUser, setCurrentUser] = useState(null);
  const [menuItems, setMenuItems] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams({});

  function removeLanguageParam() {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("lang");
    setSearchParams(newSearchParams);
  }

  useEffect(() => {
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
      // console.log("Got language from storage:", lang);
      if (lang && lang !== "undefined") {
        setUserLanguage(lang);
      }
    }, console.log);

    // retrieve the menu items from the API
    if (!menuItems) {
      fetchFromAPI("pages").then(
        (res) => res.ok && res.json().then(setMenuItems),
        (error) => console.log("Error fetching menu items.", error)
      );
    }
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
  if (!pageContent || !menuItems) {
    return (
      <div className="centred" style={{ marginTop: "35vh" }}>
        <h2>Loading Guzek UK...</h2>
      </div>
    );
  }
  return (
    <div className="App">
      <NavigationBar
        data={pageContent}
        selectedLanguage={userLanguage}
        changeLang={changeLang}
        menuItems={menuItems}
        user={currentUser}
      />
      <Routes>
        <Route path="/" element={<Home data={pageContent} />} />
        <Route path="konrad" element={<Konrad data={pageContent} />} />
        <Route path="profile" element={<Profile data={pageContent} user={currentUser} setUser={setCurrentUser} />} />
        <Route path="*" element={<NotFound data={pageContent} />} />
      </Routes>
      <Footer data={pageContent} />
    </div>
  );
}

export default App;

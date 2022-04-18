import { useState, useEffect } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "./styles/styles.css";
import TRANSLATIONS from "./translations";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Konrad from "./pages/Konrad";
import NotFound from "./pages/NotFound";
import { fetchCachedData, readResponseBody } from "./backend";
import Profile from "./pages/Profile";
import PipeDesigner from "./pages/PipeDesigner";

function App() {
  const [userLanguage, setUserLanguage] = useState("EN");
  const [currentUser, setCurrentUser] = useState(null);
  const [menuItems, setMenuItems] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    /** Removes the given search parameter from the client-side URL. */
    function removeSearchParam(param) {
      const oldValue = searchParams.get(param);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete(param);
      setSearchParams(newSearchParams);
      return oldValue || "";
    }
    // If the URL contains the lang parameter, clear it
    const lang = removeSearchParam("lang").toUpperCase();
    const newPageContent = TRANSLATIONS[lang];
    if (newPageContent) {
      // Set the page content to the translations corresponding to the lang parameter
      setUserLanguage(lang);
      return;
    }

    // The search parameter language was invalid or not set
    AsyncStorage.getItem("userLanguage").then(
      (lang) => {
        // Check for `undefined` serialised as a string
        if (lang && lang !== "undefined") {
          setUserLanguage(lang);
        }
      },
      (error) => console.error(error.message)
    );
  }, [searchParams]);

  useEffect(() => {
    if (menuItems) {
      return;
    }
    // Retrieve the menu items from the API
    async function fetchPagesData() {
      try {
        const res = await fetchCachedData("pages");
        setMenuItems(await readResponseBody(res, []));
      } catch (networkError) {
        console.log("Could not fetch from API:", networkError);
        setMenuItems([]);
      }
    }
    fetchPagesData();
  }, [menuItems]);

  useEffect(() => {
    // Update user language preferences so they are saved on refresh
    AsyncStorage.setItem("userLanguage", userLanguage).then();
  }, [userLanguage]);

  /** Event handler for when the user selects one of the lanugage options. */
  function changeLang(e) {
    e.preventDefault();
    // Get the button text and remove whitespaces as well as Non-Breaking Spaces (&nbsp;)
    const elemText = e.target.textContent || e.target.innerText;
    const lang = elemText.replace(/[\s\u00A0]/, "");
    if (TRANSLATIONS[lang]) {
      setUserLanguage(lang);
    }
  }

  const pageContent = TRANSLATIONS[userLanguage];
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
        <Route index element={<Home data={pageContent} />} />
        <Route path="konrad" element={<Konrad data={pageContent} />} />
        <Route
          path="pipe-designer"
          element={<PipeDesigner data={pageContent} />}
        />
        <Route
          path="profile"
          element={
            <Profile
              data={pageContent}
              user={currentUser}
              setUser={setCurrentUser}
            />
          }
        />
        <Route path="*" element={<NotFound data={pageContent} />} />
      </Routes>
      <Footer data={pageContent} />
    </div>
  );
}

export default App;

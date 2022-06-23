import React, { useState, useEffect, MouseEvent } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import TRANSLATIONS from "./translations";
import NavigationBar, { MenuItem } from "./components/NavigationBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Konrad from "./pages/Konrad";
import NotFound from "./pages/NotFound";
import { fetchCachedData } from "./backend";
import Profile from "./pages/Profile";
import PipeDesigner from "./pages/PipeDesigner";
import LoadingScreen from "./components/LoadingScreen";
import "./styles/styles.css";
import "./styles/forms.css";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";

export interface User {
  name: string;
  surname: string;
  email: string;
  admin: boolean;
  token: string;
}

export default function App() {
  const [userLanguage, setUserLanguage] = useState<string>("EN");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (currentUser) {
      if (!localUser) {
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } else if (localUser) {
      setCurrentUser(JSON.parse(localUser));
    }
  }, [currentUser]);

  useEffect(() => {
    /** Removes the given search parameter from the client-side URL. */
    function removeSearchParam(param: string) {
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
    const prevLang = localStorage.getItem("userLanguage");
    if (prevLang && prevLang !== "undefined") {
      setUserLanguage(prevLang);
    }
  }, [searchParams]);

  useEffect(() => {
    if (menuItems) {
      return;
    }
    // Retrieve the menu items from the API
    (async function fetchPagesData() {
      try {
        const res = await fetchCachedData("pages");
        const body = (await res.json()) as MenuItem[];
        setMenuItems(body);
      } catch (networkError) {
        console.log("Could not fetch from API:", networkError);
        setMenuItems([]);
      }
    })();
  }, [menuItems]);

  useEffect(() => {
    // Update user language preferences so they are saved on refresh
    localStorage.setItem("userLanguage", userLanguage);
  }, [userLanguage]);

  /** Event handler for when the user selects one of the lanugage options. */
  function changeLang(evt: MouseEvent<HTMLButtonElement>) {
    evt.preventDefault();
    // Get the button text and remove whitespaces as well as Non-Breaking Spaces (&nbsp;)
    const button = evt.target as HTMLButtonElement;
    const elemText = button.textContent || button.innerText;
    const lang = elemText.replace(/[\s\u00A0]/, "");
    if (TRANSLATIONS.hasOwnProperty(lang)) {
      setUserLanguage(lang);
    }
  }

  const pageContent = TRANSLATIONS[userLanguage];
  if (!pageContent || !menuItems) {
    return (
      <LoadingScreen text={`${pageContent.loading} ${pageContent.title}`} />
    );
  }
  return (
    <div className="App">
      <NavigationBar
        data={pageContent}
        selectedLanguage={userLanguage}
        changeLang={changeLang}
        menuItems={menuItems as MenuItem[]}
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
        <Route
          path="login"
          element={
            <LogIn
              data={pageContent}
              user={currentUser}
              setUser={setCurrentUser}
            />
          }
        />
        <Route
          path="signup"
          element={
            <SignUp
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

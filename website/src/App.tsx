import React, { useState, useEffect, MouseEvent } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import TRANSLATIONS from "./translations";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import PageTemplate from "./pages/PageTemplate";
import ErrorPage from "./pages/Error";
import { fetchCachedData } from "./backend";
import Profile from "./pages/Profile";
import PipeDesigner from "./pages/PipeDesigner";
import LoadingScreen from "./components/LoadingScreen";
import "./styles/styles.css";
import "./styles/forms.css";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import { ErrorCode, Language, MenuItem, User } from "./models";
import ContentManager from "./pages/ContentManager";
import { PAGE_NAME } from "./util";

export default function App() {
  const [userLanguage, setUserLanguage] = useState<Language>(Language.EN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  function setLanguage(langString: string) {
    if (!(langString in Language)) {
      throw Error("Invalid language name.");
    }
    const newLang = Language[langString as keyof typeof Language];
    localStorage.setItem("userLanguage", langString);
    setUserLanguage(newLang);
  }

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
    try {
      // Set the page content to the translations corresponding to the lang parameter
      setLanguage(lang);
    } catch {
      // The search parameter language was invalid or not set
      const prevLang = localStorage.getItem("userLanguage");
      if (!prevLang || prevLang === "undefined") return;
      setLanguage(prevLang);
    }
  }, [searchParams]);

  useEffect(() => {
    if (menuItems) {
      return;
    }
    // Retrieve the menu items from the API
    (async () => {
      try {
        const res = await fetchCachedData("pages");
        const body: MenuItem[] = await res.json();
        setMenuItems(body);
      } catch (networkError) {
        console.log("Could not fetch from API:", networkError);
        setMenuItems([]);
      }
    })();
  }, [menuItems]);

  /** Event handler for when the user selects one of the lanugage options. */
  function changeLang(evt: MouseEvent<HTMLButtonElement>) {
    evt.preventDefault();
    // Get the button text and remove whitespaces as well as Non-Breaking Spaces (&nbsp;)
    const button = evt.target as HTMLButtonElement;
    const elemText = button.textContent || button.innerText;
    const lang = elemText.replace(/[\s\u00A0]/, "");
    try {
      setLanguage(lang);
    } catch (error) {
      console.error(error as Error);
    }
  }

  const pageContent = TRANSLATIONS[userLanguage];
  if (!pageContent || !menuItems) {
    return <LoadingScreen text={`${pageContent.loading} ${PAGE_NAME}`} />;
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
        {menuItems
          .filter((item) => item.shouldFetch)
          .map((item) => (
            <Route
              path={item.url}
              element={<PageTemplate pageData={item} lang={userLanguage} />}
            />
          ))}
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
        <Route
          path="content-manager"
          element={<ContentManager data={pageContent} user={currentUser} />}
        />
        <Route
          path="*"
          element={
            <ErrorPage pageData={pageContent.error[ErrorCode.NotFound]} />
          }
        />
      </Routes>
      <Footer data={pageContent} />
    </div>
  );
}

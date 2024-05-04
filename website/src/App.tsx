import React, { useState, useEffect, MouseEvent } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import TRANSLATIONS from "./misc/translations";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import PageTemplate from "./pages/PageTemplate";
import ErrorPage from "./pages/ErrorPage";
import { getCache } from "./misc/backend";
import Profile from "./pages/Profile";
import LoadingScreen from "./components/LoadingScreen";
import "./styles/styles.css";
import "./styles/forms.css";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import { ErrorCode, Language, MenuItem, User } from "./misc/models";
import ContentManager from "./pages/ContentManager";
import { PAGE_NAME, tryFetch } from "./misc/util";
import Base from "./pages/LiveSeries/Base";
import MostPopular from "./pages/LiveSeries/MostPopular";
import Home from "./pages/LiveSeries/Home";
import Search from "./pages/LiveSeries/Search";
import TvShow from "./pages/LiveSeries/TvShow";

/** When set to `true`, doesn't remove caches whose creation date is unknown. */
const IGNORE_INVALID_RESPONSE_DATES = false;

export default function App() {
  const [userLanguage, setUserLanguage] = useState<Language>(Language.EN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [reload, setReload] = useState(false);

  function setLanguage(langString: string) {
    if (!(langString in Language)) {
      throw Error("Invalid language name.");
    }
    const newLang = Language[langString as keyof typeof Language];
    localStorage.setItem("userLanguage", langString);
    setUserLanguage(newLang);
  }

  /** Checks if any of the saved caches is older than the version on the server.
   *  If so, fetch the updated version and replace the cache.
   */
  async function removeOldCaches() {
    const defaultData: { [endpoint: string]: number } = {};
    const updated = await tryFetch("updated", {}, defaultData, false);
    const updatedEndpoints = new Set();
    const cache = await getCache();
    if (!cache) {
      console.warn(
        "Detected a browser that prohibits access to cache on the local disk."
      );
      return;
    }
    const cachedResponses = await cache.matchAll();
    for (let i = 0; i < cachedResponses.length; i++) {
      const res = cachedResponses[i];
      // console.debug(
      //   "Checking cached response",
      //   i + 1,
      //   "/",
      //   cachedResponses.length,
      //   `'${res.url}'`,
      //   // Object.fromEntries(res.headers.entries()),
      //   "..."
      // );
      const resTimestamp = parseInt(res.headers.get("Pragma") ?? "0");
      if (!res.url) {
        continue;
      }
      const url = new URL(res.url);
      // Extract the base path (only first subdirectory of URL path)
      const [_, endpoint] = /^\/([^\/]*)(?:\/.*)?$/.exec(url.pathname) ?? [];
      if (!endpoint) continue;
      // console.debug(
      //   "Cache date:",
      //   resTimestamp,
      //   `| Endpoint '${endpoint}' last updated:`,
      //   updated[endpoint]
      // );
      if (
        resTimestamp > updated[endpoint] ||
        (IGNORE_INVALID_RESPONSE_DATES && !resTimestamp)
      ) {
        // const diff = getDuration(resTimestamp - updated[endpoint]);

        // console.debug(
        //   "Cache was created",
        //   diff.formatted,
        //   "after the last change on the server."
        // );
        continue;
      }
      updatedEndpoints.add(endpoint);
      const deleted = await cache.delete(res.url);
      console.info(
        "Deleted cache",
        res.url,
        (deleted ? "" : "UN") + "SUCCESSFULLY"
      );
    }
    if (updatedEndpoints.size > 0) {
      console.info("Updated endpoints:", updatedEndpoints);
      setReload(true);
    } else {
      // console.debug("All cached responses are up-to-date.");
    }
  }

  useEffect(() => {
    // Remove outdated caches
    removeOldCaches();
  }, []);

  useEffect(() => {
    if (!reload) return;

    setReload(false);
    fetchPages();
  }, [reload]);

  useEffect(() => {
    fetchPages();
  }, [userLanguage]);

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
      setSearchParams(newSearchParams, { replace: true });
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

  /** Retrieve the menu items from the API */
  async function fetchPages() {
    const data = await tryFetch(
      "pages",
      { lang: userLanguage },
      [] as MenuItem[]
    );
    setMenuItems(data);
  }

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

  const forbiddenErrorPage = (
    <ErrorPage data={pageContent} errorCode={ErrorCode.Forbidden} />
  );
  const notFoundErrorPage = (
    <ErrorPage data={pageContent} errorCode={ErrorCode.NotFound} />
  );
  const unauthorizedErrorPage = (
    <ErrorPage data={pageContent} errorCode={ErrorCode.Unauthorized} />
  );

  return (
    <>
      <NavigationBar
        data={pageContent}
        selectedLanguage={userLanguage}
        changeLang={changeLang}
        menuItems={menuItems.filter(
          (item) => !item.adminOnly || currentUser?.admin
        )}
        user={currentUser}
      />
      <Routes>
        {menuItems
          .filter((item) => item.shouldFetch)
          .map((item, idx) => (
            <Route
              key={idx}
              path={item.url}
              element={
                <PageTemplate
                  reload={reload}
                  pageData={item}
                  lang={userLanguage}
                />
              }
            />
          ))}
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
          element={
            currentUser?.admin ? (
              <ContentManager
                data={pageContent}
                lang={userLanguage}
                menuItems={menuItems}
                reloadSite={removeOldCaches}
              />
            ) : (
              forbiddenErrorPage
            )
          }
        />
        <Route
          path="liveseries"
          element={
            currentUser ? (
              <Base data={pageContent}></Base>
            ) : (
              unauthorizedErrorPage
            )
          }
        >
          <Route index element={<Home data={pageContent} />} />
          <Route
            path="most-popular"
            element={<MostPopular data={pageContent} />}
          />
          <Route path="search" element={<Search data={pageContent} />} />
          <Route path="tv-show">
            <Route index element={notFoundErrorPage} />
            <Route path=":tvShowId" element={<TvShow data={pageContent} />} />
          </Route>
          <Route path="*" element={notFoundErrorPage} />
        </Route>
        <Route path="*" element={notFoundErrorPage} />
      </Routes>
      <Footer data={pageContent} />
    </>
  );
}

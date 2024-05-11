import React, { useState, useEffect, MouseEvent } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import { TRANSLATIONS } from "./misc/translations";
import NavigationBar from "./components/Navigation/NavigationBar";
import Footer from "./components/Footer/Footer";
import PageTemplate from "./pages/PageTemplate";
import ErrorPage from "./pages/ErrorPage";
import {
  clearStoredLoginInfo,
  Fetch,
  getCache,
  getFetchFromAPI,
} from "./misc/backend";
import Profile from "./pages/Profile";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import "./styles/styles.css";
import "./styles/forms.css";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import { ErrorCode, Language, MenuItem, User } from "./misc/models";
import ContentManager from "./pages/Admin/ContentManager";
import { getLocalUser, getTryFetch, PAGE_NAME } from "./misc/util";
import LiveSeriesBase from "./pages/LiveSeries/Base";
import MostPopular from "./pages/LiveSeries/MostPopular";
import Home from "./pages/LiveSeries/Home";
import Search from "./pages/LiveSeries/Search";
import TvShow from "./pages/LiveSeries/TvShow";
import Modal, { ModalHandler } from "./components/Modal/Modal";
import AdminBase from "./pages/Admin/Base";
import Users from "./pages/Admin/Users";
import Logs from "./pages/Admin/Logs";
import {
  Auth,
  AuthContext,
  FetchContext,
  ModalContext,
  TranslationContext,
} from "./misc/context";
import UserPage from "./pages/Admin/User";

/** When set to `true`, doesn't remove caches whose creation date is unknown. */
const IGNORE_INVALID_RESPONSE_DATES = false;

export default function App() {
  const [userLanguage, setUserLanguage] = useState<Language>(Language.EN);
  const [modalInfo, setModalInfo] = useState<string | undefined>();
  const [modalError, setModalError] = useState<string | undefined>();
  const [modalChoice, setModalChoice] = useState<string | undefined>();
  const [modalChoiceResolve, setModalChoiceResolve] = useState<ModalHandler>(
    () => () => {}
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [reload, setReload] = useState(false);

  const pageContent = TRANSLATIONS[userLanguage];

  const authContext: Auth = {
    user: currentUser,
    setUser: setCurrentUser,
    logout,
  };

  const fetchFromAPI = getFetchFromAPI(authContext);

  const fetchContext: Fetch = {
    fetchFromAPI,
    tryFetch: getTryFetch(fetchFromAPI, setModalError, pageContent),
    removeOldCaches,
  };

  function setLanguage(langString: string) {
    if (!(langString in Language)) {
      throw Error("Invalid language name.");
    }
    const newLang = Language[langString as keyof typeof Language];
    localStorage.setItem("userLanguage", langString);
    setUserLanguage(newLang);
  }

  function logout() {
    setCurrentUser(null);
    setModalInfo(pageContent.loggedOut);
  }

  /** Checks if any of the saved caches is older than the version on the server.
   *  If so, fetch the updated version and replace the cache.
   */
  async function removeOldCaches() {
    const defaultData: { [endpoint: string]: number } = {};
    const updated = await fetchContext.tryFetch(
      "updated",
      {},
      defaultData,
      false
    );
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
      const [_, endpoint] =
        /^\/(?:liveseries|auth\/)?([^\/]*)(?:\/.*)?$/.exec(url.pathname) ?? [];
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
      console.debug(
        "Deleted cache",
        res.url,
        (deleted ? "" : "UN") + "SUCCESSFULLY"
      );
    }
    if (updatedEndpoints.size > 0) {
      console.debug("Updated endpoints:", updatedEndpoints);
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
    const localUser = getLocalUser();
    if (currentUser) {
      if (!localUser) {
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } else if (localUser) {
      setCurrentUser(localUser);
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
    const data = await fetchContext.tryFetch(
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

  if (!pageContent || !menuItems) {
    return <LoadingScreen text={`${pageContent.loading} ${PAGE_NAME}`} />;
  }

  const forbiddenErrorPage = <ErrorPage errorCode={ErrorCode.Forbidden} />;
  // const unauthorizedErrorPage = (
  //   <ErrorPage  errorCode={ErrorCode.Unauthorized} />
  // );

  return (
    <AuthContext.Provider value={authContext}>
      <FetchContext.Provider value={fetchContext}>
        <ModalContext.Provider
          value={{
            setModalInfo,
            setModalError: (value?: string) => {
              if (
                value === '{"401 Unauthorised":"Missing authorisation token."}'
              ) {
                clearStoredLoginInfo();
                logout();
              }
              setModalError(value);
            },
            setModalChoice: (message) =>
              new Promise((resolve) => {
                setModalChoice(message);
                setModalChoiceResolve(() => resolve);
              }),
          }}
        >
          <TranslationContext.Provider value={pageContent}>
            <Modal value={modalInfo} onClick={() => setModalInfo("")} />
            <Modal
              className="error"
              value={modalError}
              onClick={() => setModalError("")}
            />
            <Modal
              value={modalChoice}
              labelPrimary={pageContent.modal.yes}
              labelSecondary={pageContent.modal.no}
              onClick={(primary) => {
                modalChoiceResolve(primary);
                setModalChoice("");
              }}
            />
            <NavigationBar
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
              <Route path="profile" element={<Profile />} />
              <Route path="login" element={<LogIn />} />
              <Route path="signup" element={<SignUp />} />
              <Route
                path="admin"
                element={
                  currentUser?.admin ? <AdminBase /> : forbiddenErrorPage
                }
              >
                <Route
                  path="content-manager"
                  element={
                    <ContentManager lang={userLanguage} menuItems={menuItems} />
                  }
                />
                <Route path="users">
                  <Route index element={<Users />} />
                  <Route path=":uuid" element={<UserPage />} />
                </Route>
                <Route path="logs" element={<Logs />} />
              </Route>
              <Route path="liveseries" element={<LiveSeriesBase />}>
                <Route index element={<Home />} />
                <Route path="most-popular" element={<MostPopular />} />
                <Route path="search" element={<Search />} />
                <Route path="tv-show/:permalink" element={<TvShow />} />
              </Route>
              <Route
                path="*"
                element={<ErrorPage errorCode={ErrorCode.NotFound} />}
              />
            </Routes>
            <Footer />
          </TranslationContext.Provider>
        </ModalContext.Provider>
      </FetchContext.Provider>
    </AuthContext.Provider>
  );
}

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCache, getFetchFromAPI } from "@/lib/backend";
import { useAuth } from "./auth-context";
import { getDuration, getTryFetch } from "@/lib/util";
import { useTranslations } from "./translation-context";
import { useModals } from "./modal-context";
import { MenuItem, TryFetch } from "@/lib/models";
import NavigationBar from "@/components/navigation/navigation-bar";

/** When set to `true`, doesn't remove caches whose creation date is unknown. */
const IGNORE_INVALID_RESPONSE_DATES = false;

const LOG_CACHE_INVALIDATION = false;

interface FetchData {
  fetchFromAPI: ReturnType<typeof getFetchFromAPI>;
  tryFetch: TryFetch;
  removeOldCaches: () => void;
  menuItems: MenuItem[] | null;
  reload: boolean;
}

const FetchContext = createContext<FetchData | undefined>(undefined);

export function useFetch() {
  const context = useContext(FetchContext);
  if (!context) {
    throw new Error("useFetch must be used within a FetchProvider.");
  }
  return context;
}

export function FetchProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [filterCachesPromise, setFilterCachesPromise] =
    useState<null | Promise<void>>(null);
  const authContext = useAuth();
  const { data, userLanguage } = useTranslations();
  const { setModalError } = useModals();

  useEffect(() => {
    // Remove outdated caches
    filterCaches();
  }, []);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (!reload) return;

    setReload(false);
    fetchPages();
  }, [reload]);

  useEffect(() => {
    fetchPages();
  }, [userLanguage]);

  /** Retrieve the menu items from the API */
  async function fetchPages() {
    const data = await fetchContext.tryFetch(
      "pages",
      { lang: userLanguage },
      [] as MenuItem[]
    );
    setMenuItems(data);
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
      LOG_CACHE_INVALIDATION &&
        console.debug(
          "Checking cached response",
          i + 1,
          "/",
          cachedResponses.length,
          `'${res.url}'`,
          // Object.fromEntries(res.headers.entries()),
          "..."
        );
      const resTimestamp = parseInt(res.headers.get("Pragma") ?? "0");
      if (!res.url) {
        continue;
      }
      const url = new URL(res.url);
      // Extract the base path (only first subdirectory of URL path)
      const endpoint = /^\/(?:liveseries\/|auth\/)?([^\/]*)(?:\/.*)?$/.exec(
        url.pathname
      )?.[1];
      if (!endpoint) {
        console.debug("Cache does not match regex:", url.pathname);
        return;
      }
      LOG_CACHE_INVALIDATION &&
        console.debug(
          "Cache date:",
          resTimestamp,
          `| Endpoint '${endpoint}' last updated:`,
          updated[endpoint]
        );
      if (
        resTimestamp > updated[endpoint] ||
        (IGNORE_INVALID_RESPONSE_DATES && !resTimestamp)
      ) {
        const diff = getDuration(resTimestamp - updated[endpoint]);

        LOG_CACHE_INVALIDATION &&
          console.debug(
            "Cache was created",
            diff.formatted,
            "after the last change on the server."
          );
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

  const fetchFromAPI = getFetchFromAPI(authContext, filterCachesPromise);
  const filterCaches = () => setFilterCachesPromise(removeOldCaches());

  const fetchContext: FetchData = {
    fetchFromAPI,
    tryFetch: getTryFetch(fetchFromAPI, setModalError, data),
    removeOldCaches: filterCaches,
    menuItems,
    reload,
  };

  return (
    <FetchContext.Provider value={fetchContext}>
      <NavigationBar
        selectedLanguage={userLanguage}
        menuItems={menuItems?.filter(
          (item) => !item.adminOnly || authContext.user?.admin
        )}
      />
      {children}
    </FetchContext.Provider>
  );
}

"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  DownloadedEpisode,
  DownloadStatus,
  ShowData,
  StateSetter,
  UserShows,
  WatchedEpisodes,
} from "@/lib/types";
import { fetchFromEpisodate } from "@/lib/episodate";
import { compareEpisodes, getErrorMessage } from "@/lib/util";
import { getAccessToken } from "@/lib/backend";
import { useAuth } from "./auth-context";
import { useModals } from "./modal-context";
import { useFetch } from "./fetch-context";
import { useTranslations } from "./translation-context";

interface LiveSeriesContextType {
  loading: string[];
  fetchResource: (
    endpoint: string,
    {
      method,
      params,
      onSuccess,
      onError,
      useEpisodate,
    }: {
      method?: string;
      params?: Record<string, string>;
      body?: Record<string, any>;
      onSuccess?: (data: any) => void;
      onError?: () => void;
      useEpisodate?: boolean;
    }
  ) => Promise<void>;
  userShows: null | UserShows;
  watchedEpisodes: null | ShowData<WatchedEpisodes>;
  setWatchedEpisodes: StateSetter<null | ShowData<WatchedEpisodes>>;
  downloadedEpisodes: DownloadedEpisode[];
  monitorEpisodeDownloads: (
    data: DownloadedEpisode,
    episodePredicate: (val: DownloadedEpisode) => boolean,
    episodeString: string
  ) => void;
}

const LiveSeriesContext = createContext<LiveSeriesContextType>({
  loading: [],
  fetchResource: async () => {},
  userShows: null,
  watchedEpisodes: null,
  setWatchedEpisodes: () => {},
  downloadedEpisodes: [],
  monitorEpisodeDownloads: () => {},
});

export function useLiveSeries() {
  const context = useContext(LiveSeriesContext);
  if (!context) {
    throw new Error("useLiveSeries must be used within a LiveSeriesProvider.");
  }
  return context;
}

const serialiseEpisodeForSorting = (episode: DownloadedEpisode) =>
  `${episode.showName}.${episode.season}.${episode.episode}`;

export function LiveSeriesProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<string[]>([]);
  const [watchedEpisodes, setWatchedEpisodes] =
    useState<null | ShowData<WatchedEpisodes>>(null);
  const [likedShowsUpdated, setUserShowsUpdated] = useState(false);
  const [watchedEpisodesUpdated, setWatchedEpisodesUpdated] = useState(false);
  const [userShows, setUserShows] = useState<null | UserShows>(null);
  const [existingSocket, setExistingSocket] = useState<null | WebSocket>(null);
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<
    DownloadedEpisode[]
  >([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data } = useTranslations();
  const { fetchFromAPI } = useFetch();
  const authContext = useAuth();
  const { setModalInfo, setModalError, setModalChoice } = useModals();

  const { user } = authContext;

  useEffect(() => {
    if (likedShowsUpdated) {
      setUserShowsUpdated(false);
      fetchUserShows();
    }
    if (watchedEpisodesUpdated) {
      setWatchedEpisodesUpdated(false);
      fetchWatchedEpisodes();
    }
  }, [pathname]);

  function fetchUserShows() {
    fetchResource("shows/personal", {
      onSuccess: setUserShows,
      useEpisodate: false,
    });
  }

  function fetchWatchedEpisodes() {
    fetchResource("watched-episodes/personal", {
      onSuccess: setWatchedEpisodes,
      useEpisodate: false,
    });
  }

  async function fetchResource(
    endpoint: string,
    {
      method,
      params,
      body,
      onSuccess = () => {},
      onError = () => {},
      useEpisodate = true,
    }: {
      method?: string;
      params?: Record<string, string>;
      body?: Record<string, any>;
      onSuccess?: (data: any) => void;
      onError?: () => void;
      useEpisodate?: boolean;
    }
  ) {
    if (!user && !useEpisodate) {
      if (method) {
        setModalError(data.liveSeries.home.login);
        onError();
      } else {
        setUserShows({ likedShows: [], subscribedShows: [] });
        setWatchedEpisodes({});
      }
      return;
    }
    method || setLoading((old) => [...old, endpoint]);
    try {
      const res = await (useEpisodate
        ? fetchFromEpisodate(endpoint, params ?? searchParams ?? undefined)
        : fetchFromAPI("liveseries/" + endpoint, { method, body }, !method));
      if (res.status === 204) return onSuccess(null);
      const json = await res.json();
      if (res.ok) {
        onSuccess(json);
        if (method) {
          switch (endpoint.split("/")[0]) {
            case "shows":
              setUserShowsUpdated(true);
              break;
            case "watched-episodes":
              setWatchedEpisodesUpdated(true);
              break;
            default:
              break;
          }
        }
      } else {
        setModalError(getErrorMessage(res, json, data));
        // TODO: erm why do I have router.push(pathname) here?
        router.push(pathname);
        onError();
      }
    } catch (error) {
      console.error(error);
      // TODO: and here...
      router.push(pathname);
      onError();
    }
    method || setLoading((old) => old.filter((value) => value !== endpoint));
  }

  useEffect(() => {
    if (!userShows?.likedShows?.length || !userShows?.subscribedShows?.length)
      fetchUserShows();
    fetchWatchedEpisodes();
    if (!user) return;
    connectToWebsocket();
    return () => {
      if (!existingSocket) return;
      const socket = existingSocket;
      setExistingSocket(null);
      socket.close();
    };
  }, [user]);

  const hasDecentralisedServer = user?.serverUrl?.startsWith("http");

  async function connectToWebsocket() {
    let socketFailed: boolean | undefined = undefined;
    if (existingSocket) return;
    if (!hasDecentralisedServer) {
      console.warn("No decentralised server URL provided.");
      return;
    }
    const accessToken = await getAccessToken(authContext);
    if (!accessToken) return;

    let socket: WebSocket;
    const websocketUrlBase = user?.serverUrl?.replace("http", "ws");
    try {
      socket = new WebSocket(
        `${websocketUrlBase}liveseries/downloaded-episodes/ws?access_token=${accessToken}`
      );
    } catch (error) {
      console.error("Websocket instantiation error:", error);
      setModalError(data.liveSeries.websockets.connectionFailed);
      return;
    }
    setExistingSocket(socket);
    socket.onerror = (message) => {
      // This usually means the server is online but hasn't yet set up the websocket listener
      // If socketFailed has not yet been set to `false`, it means the server is not reachable
      console.error(
        socketFailed === undefined ? "Connection error" : "Unknown error:",
        message
      );
      setModalError(
        socketFailed === undefined
          ? data.liveSeries.websockets.connectionFailed
          : data.liveSeries.websockets.error
      );
      socketFailed = true;
    };
    const poll = (data: DownloadedEpisode[]) =>
      socket.send(JSON.stringify({ type: "poll", data }));
    socket.onopen = () => {
      poll([]);
      socketFailed = false;
    };
    socket.onclose = async (evt) => {
      if (evt.wasClean) {
        // The server URL is probably misconfigured
        setModalError(data.liveSeries.websockets.connectionFailed);
        return;
      }
      if (socketFailed) return;
      const reconnect = await setModalChoice(
        data.liveSeries.websockets.askReconnect
      );
      if (reconnect) await connectToWebsocket();
    };
    socket.onmessage = (message) => {
      const torrentInfo = JSON.parse(message.data).data as DownloadedEpisode[];
      let completedDownloadName = "";
      setDownloadedEpisodes((currentDownloadedEpisodes) => {
        const mapped = torrentInfo.map((val) => {
          const found = currentDownloadedEpisodes.find((info) =>
            compareEpisodes(val, info)
          );
          if (!found) return val;
          // Check for episodes whose download status just changed
          if (
            found.status !== DownloadStatus.COMPLETE &&
            val.status === DownloadStatus.COMPLETE
          )
            completedDownloadName = `${
              val.showName
            } ${data.liveSeries.episodes.serialise(val)}`;
          return val;
        });
        //for (const info of torrentInfo) {
        //if (currentDownloadedEpisodes.find((val) => compareEpisodes(val, info))) continue;
        //mapped.push(info);
        //}
        const sorted = mapped.sort((a, b) =>
          serialiseEpisodeForSorting(a).localeCompare(
            serialiseEpisodeForSorting(b),
            "en",
            { numeric: true }
          )
        );
        poll(sorted);
        return sorted;
      });
      if (completedDownloadName)
        setModalInfo(
          data.liveSeries.episodes.downloadComplete(completedDownloadName)
        );
    };
  }

  function monitorEpisodeDownloads(
    data: DownloadedEpisode,
    episodePredicate: (val: DownloadedEpisode) => boolean,
    _episodeString: string
  ) {
    setDownloadedEpisodes((old) =>
      old.find(episodePredicate)
        ? old.map((val) => (episodePredicate(val) ? data : val))
        : [...old, data]
    );
  }

  const context: LiveSeriesContextType = {
    loading,
    fetchResource,
    userShows,
    watchedEpisodes,
    setWatchedEpisodes,
    downloadedEpisodes,
    monitorEpisodeDownloads,
  };

  return (
    <LiveSeriesContext.Provider value={context}>
      {children}
    </LiveSeriesContext.Provider>
  );
}

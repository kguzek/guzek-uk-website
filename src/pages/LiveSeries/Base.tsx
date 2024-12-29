import React, { useContext, useEffect, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { MiniNavBar } from "../../components/Navigation/NavigationBar";
import DownloadsWidget from "../../components/LiveSeries/DownloadsWidget";
import {
  AuthContext,
  ModalContext,
  TranslationContext,
  useFetchContext,
} from "../../misc/context";
import { fetchFromEpisodate } from "../../misc/episodate";
import {
  ShowData,
  StateSetter,
  WatchedEpisodes,
  DownloadedEpisode,
  DownloadStatus,
} from "../../misc/models";
import { getErrorMessage, compareEpisodes } from "../../misc/util";
import "./Liveseries.css";
import { getAccessToken } from "../../misc/backend";

export type LiveSeriesOutletContext = {
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
};

const serialiseEpisodeForSorting = (episode: DownloadedEpisode) =>
  `${episode.showName}.${episode.season}.${episode.episode}`;

interface UserShows {
  likedShows?: number[];
  subscribedShows?: number[];
}

export default function LiveSeriesBase() {
  const [loading, setLoading] = useState<string[]>([]);
  const [likedShowsUpdated, setUserShowsUpdated] = useState(false);
  const [watchedEpisodesUpdated, setWatchedEpisodesUpdated] = useState(false);
  const [userShows, setUserShows] = useState<null | UserShows>(null);
  const [existingSocket, setExistingSocket] = useState<null | WebSocket>(null);
  const [watchedEpisodes, setWatchedEpisodes] =
    useState<null | ShowData<WatchedEpisodes>>(null);
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<
    DownloadedEpisode[]
  >([]);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useContext(TranslationContext);
  const authContext = useContext(AuthContext);
  const { user } = authContext;
  const { fetchFromAPI } = useFetchContext();
  const { setModalInfo, setModalError, setModalChoice } =
    useContext(ModalContext);

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

  useEffect(() => {
    if (likedShowsUpdated) {
      setUserShowsUpdated(false);
      fetchUserShows();
    }
    if (watchedEpisodesUpdated) {
      setWatchedEpisodesUpdated(false);
      fetchWatchedEpisodes();
    }
  }, [location]);

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
        ? fetchFromEpisodate(endpoint, params ?? searchParams)
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
        setSearchParams("");
        onError();
      }
    } catch (error) {
      console.error(error);
      setModalError(data.networkError);
      setSearchParams("");
      onError();
    }
    method || setLoading((old) => old.filter((value) => value !== endpoint));
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

  const context: LiveSeriesOutletContext = {
    loading,
    fetchResource,
    userShows,
    watchedEpisodes,
    setWatchedEpisodes,
    downloadedEpisodes,
    monitorEpisodeDownloads,
  };

  return (
    <div className="text liveseries">
      <DownloadsWidget
        downloadedEpisodes={downloadedEpisodes}
        fetchResource={fetchResource}
      />
      <MiniNavBar
        pathBase="liveseries"
        pages={[
          { link: "", label: data.liveSeries.home.title },
          { link: "search", label: data.liveSeries.search.title },
          { link: "most-popular", label: data.liveSeries.mostPopular.title },
        ]}
      />
      <Outlet context={context} />
    </div>
  );
}

export function getLiveSeriesTitle(
  page: "home" | "mostPopular" | "search" | "tvShow"
) {
  const data = useContext(TranslationContext);
  return `${data.liveSeries[page].title} – ${data.liveSeries.title}`;
}

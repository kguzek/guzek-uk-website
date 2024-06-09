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
import { ShowData, StateSetter, WatchedEpisodes, DownloadedEpisode } from "../../misc/models";
import { getErrorMessage } from "../../misc/util";
import { API_BASE } from "../../misc/backend";
import "./Liveseries.css";

const WEBSOCKET_URL = API_BASE.replace("http", "ws") + "liveseries/ws";

interface TorrentInfo {
  id: number;
  status: number;
  eta: number;
  rateDownload: number;
  percentDone: number;
}

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
  likedShowIds: null | number[];
  watchedEpisodes: null | ShowData<WatchedEpisodes>;
  setWatchedEpisodes: StateSetter<null | ShowData<WatchedEpisodes>>;
  downloadedEpisodes: DownloadedEpisode[];
  monitorEpisodeDownloads: (
    data: DownloadedEpisode,
    episodePredicate: (val: DownloadedEpisode) => boolean,
    episodeString: string,
  ) => void,
};

export default function LiveSeriesBase() {
  const [loading, setLoading] = useState<string[]>([]);
  const [likedShowsUpdated, setLikedShowsUpdated] = useState(false);
  const [watchedEpisodesUpdated, setWatchedEpisodesUpdated] = useState(false);
  const [likedShowIds, setLikedShowIds] = useState<null | number[]>(null);
  const [existingSocket, setExistingSocket] = useState<null | WebSocket>(null);
  const [watchedEpisodes, setWatchedEpisodes] =
    useState<null | ShowData<WatchedEpisodes>>(null);
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<DownloadedEpisode[]>([]);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useContext(TranslationContext);
  const { user } = useContext(AuthContext);
  const { fetchFromAPI } = useFetchContext();
  const { setModalInfo, setModalError } = useContext(ModalContext);

  useEffect(() => {
    if (!likedShowIds?.length) fetchLikedShows();
    fetchWatchedEpisodes();
    if (!user?.admin) return;
    fetchDownloadedEpisodes();
    if (existingSocket) return;
    let socket: WebSocket;
    try {
      socket = new WebSocket(WEBSOCKET_URL);
    } catch (error) {
      console.error("Connection error:", error);
      setModalError("Could not establish a connection with the websocket.");
      return;
    }
    setExistingSocket(socket);
    socket.onerror = (message) => {
      console.error("Unknown error:", message);
      setModalError("An unknown error occured during websocket communication.")
    };
    const poll = (data: any) => socket.send(JSON.stringify({ type: "poll", data }));
    socket.onopen = () => poll({});
    socket.onmessage = (message) => {
      const torrentInfo = JSON.parse(message.data).data as TorrentInfo[];
      setDownloadedEpisodes((old) => {
        poll(old);
        const mapped = old.map((entry) => {
          const info = torrentInfo?.find((info) => info.id === entry.torrentId);
          if (!info) return entry;
          const map = {6: 3, 4: 2} as const;
          let status = entry.status;
          const possibleStatus = map[info.status as keyof typeof map];
          if (possibleStatus != null) status = possibleStatus;
          if (status === 3 && entry.status !== 3) {
            const episodeString = data.liveSeries.tvShow.serialiseEpisode(entry);
            setModalInfo(data.liveSeries.downloadComplete.replace("{episode}", episodeString));
          }
          const progress = info.percentDone;
          const speed = info.rateDownload;
          const eta = info.eta;
          return { ...entry, status, progress, speed, eta };
        });
        const missing = [];
        for (const info of torrentInfo) {
          if (old.find((val) => val.torrentId === info.id)) continue;
          missing.push(info);
        }
        if (missing.length > 0) {
          console.warn("Missing downloaded episode infos", missing);
          console.log(mapped);
        }
        return mapped;
      });
    } 
  }, [user]);

  useEffect(() => {
    if (likedShowsUpdated) {
      setLikedShowsUpdated(false);
      fetchLikedShows();
    }
    if (watchedEpisodesUpdated) {
      setWatchedEpisodesUpdated(false);
      fetchWatchedEpisodes();
    }
  }, [location]);

  function fetchLikedShows() {
    fetchResource("liked-shows/personal", {
      onSuccess: setLikedShowIds,
      useEpisodate: false,
    });
  }

  function fetchWatchedEpisodes() {
    fetchResource("watched-episodes/personal", {
      onSuccess: setWatchedEpisodes,
      useEpisodate: false,
    });
  }

  function fetchDownloadedEpisodes() {
    fetchResource("downloaded-episodes", {
      useEpisodate: false,
      onSuccess: (data) => {
        setDownloadedEpisodes(data as DownloadedEpisode[]);
      },
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
        setLikedShowIds([]);
        setWatchedEpisodes({});
      }
      return;
    }
    method || setLoading((old) => [...old, endpoint]);
    try {
      const res = await (useEpisodate
        ? fetchFromEpisodate(endpoint, params ?? searchParams)
        : fetchFromAPI("liveseries/" + endpoint, { method, body }, !method));
      const json = await res.json();
      if (res.ok) {
        onSuccess(json);
        if (method) {
          switch (endpoint.split("/")[0]) {
            case "liked-shows":
              setLikedShowsUpdated(true);
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
    _episodeString: string,
  ) {
    setDownloadedEpisodes((old) => old.find(episodePredicate)
      ? old.map((val) => episodePredicate(val) ? data : val)
      : [...old, data]
    );
  }

  const context: LiveSeriesOutletContext = {
    loading,
    fetchResource,
    likedShowIds,
    watchedEpisodes,
    setWatchedEpisodes,
    downloadedEpisodes,
    monitorEpisodeDownloads,
  };

  return (
    <div className="text liveseries">
      <DownloadsWidget downloadedEpisodes={downloadedEpisodes} />
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

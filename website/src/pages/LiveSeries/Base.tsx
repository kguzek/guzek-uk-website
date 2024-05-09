import React, { useContext, useEffect, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import { MiniNavBar } from "../../components/Navigation/NavigationBar";
import { fetchFromAPI } from "../../misc/backend";
import { fetchFromEpisodate } from "../../misc/episodate";
import {
  ShowData,
  StateSetter,
  User,
  WatchedEpisodes,
} from "../../misc/models";
import { Translation, TranslationContext } from "../../misc/translations";
import "./Liveseries.css";

export type OutletContext = {
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
  reloadSite: () => Promise<void>;
  likedShowIds: null | number[];
  watchedEpisodes: null | ShowData<WatchedEpisodes>;
  setWatchedEpisodes: StateSetter<null | ShowData<WatchedEpisodes>>;
};

export default function LiveSeriesBase({
  logout,
  reloadSite,
  user,
}: {
  logout: () => void;
  reloadSite: () => Promise<void>;
  user: User | null;
}) {
  const [loading, setLoading] = useState<string[]>([]);
  const [modalMessage, setModalMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [likedShowsUpdated, setLikedShowsUpdated] = useState(false);
  const [watchedEpisodesUpdated, setWatchedEpisodesUpdated] = useState(false);
  const [likedShowIds, setLikedShowIds] = useState<null | number[]>(null);
  const [watchedEpisodes, setWatchedEpisodes] =
    useState<null | ShowData<WatchedEpisodes>>(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useContext<Translation>(TranslationContext);

  useEffect(() => {
    if (likedShowIds && watchedEpisodes) return;
    fetchLikedShows();
    fetchWatchedEpisodes();
  }, []);

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
        setModalVisible(true);
        setModalMessage(data.liveSeries.home.login);
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
        : fetchFromAPI(
            "liveseries/" + endpoint,
            { method, body },
            logout,
            !method
          ));
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
        setModalMessage(JSON.stringify(json));
        setModalVisible(true);
        setSearchParams("");
        onError();
      }
    } catch (error) {
      console.error(error);
      setModalMessage("networkError");
      setModalVisible(true);
      setSearchParams("");
      onError();
    }
    method || setLoading((old) => old.filter((value) => value !== endpoint));
  }

  const context: OutletContext = {
    loading,
    fetchResource,
    reloadSite,
    likedShowIds,
    watchedEpisodes,
    setWatchedEpisodes,
  };

  return (
    <>
      <Modal
        className="error"
        message={
          modalMessage === "networkError" ? data.networkError : modalMessage
        }
        visible={modalVisible}
        onClick={() => setModalVisible(false)}
      />
      <div className="text liveseries">
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
    </>
  );
}

export const getLiveSeriesTitle = (
  data: Translation,
  page: "home" | "mostPopular" | "search" | "tvShow"
) => `${data.liveSeries[page].title} – ${data.liveSeries.title}`;


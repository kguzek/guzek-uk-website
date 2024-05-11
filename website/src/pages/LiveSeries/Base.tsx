import React, { useContext, useEffect, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { MiniNavBar } from "../../components/Navigation/NavigationBar";
import {
  AuthContext,
  ModalContext,
  TranslationContext,
  useFetchContext,
} from "../../misc/context";
import { fetchFromEpisodate } from "../../misc/episodate";
import { ShowData, StateSetter, WatchedEpisodes } from "../../misc/models";
import { getErrorMessage } from "../../misc/util";
import "./Liveseries.css";

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
};

export default function LiveSeriesBase() {
  const [loading, setLoading] = useState<string[]>([]);
  const [likedShowsUpdated, setLikedShowsUpdated] = useState(false);
  const [watchedEpisodesUpdated, setWatchedEpisodesUpdated] = useState(false);
  const [likedShowIds, setLikedShowIds] = useState<null | number[]>(null);
  const [watchedEpisodes, setWatchedEpisodes] =
    useState<null | ShowData<WatchedEpisodes>>(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useContext(TranslationContext);
  const { user } = useContext(AuthContext);
  const { fetchFromAPI } = useFetchContext();
  const { setModalError } = useContext(ModalContext);

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

  const context: LiveSeriesOutletContext = {
    loading,
    fetchResource,
    likedShowIds,
    watchedEpisodes,
    setWatchedEpisodes,
  };

  return (
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
  );
}

export function getLiveSeriesTitle(
  page: "home" | "mostPopular" | "search" | "tvShow"
) {
  const data = useContext(TranslationContext);
  return `${data.liveSeries[page].title} – ${data.liveSeries.title}`;
}

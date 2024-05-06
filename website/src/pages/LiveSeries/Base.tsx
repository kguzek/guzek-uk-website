import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useSearchParams } from "react-router-dom";
import Modal from "../../components/Modal";
import { fetchFromAPI } from "../../misc/backend";
import { fetchFromEpisodate } from "../../misc/episodate";
import { StateSetter, User } from "../../misc/models";
import { Translation } from "../../misc/translations";
import "../../styles/liveseries.css";

type LikedShowIds = null | number[];

export type OutletContext = {
  loading: boolean;
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
      onSuccess?: (data: any) => void;
      onError?: () => void;
      useEpisodate?: boolean;
    }
  ) => Promise<void>;
  likedShowIds: LikedShowIds;
  reloadSite: () => Promise<void>;
};

export default function Base({
  data,
  logout,
  reloadSite,
}: {
  data: Translation;
  logout: () => void;
  reloadSite: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [updateDetected, setUpdateDetected] = useState(false);
  const [likedShowIds, setLikedShowIds] = useState<LikedShowIds>(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (loading || likedShowIds) return;
    fetchLikedShowIds();
  }, []);

  function fetchLikedShowIds() {
    fetchResource("liked-shows/personal", {
      onSuccess: setLikedShowIds,
      useEpisodate: false,
    });
  }

  useEffect(() => {
    if (!updateDetected) return;
    setUpdateDetected(false);
    fetchLikedShowIds();
  }, [location]);

  async function fetchResource(
    endpoint: string,
    {
      method,
      params,
      onSuccess = () => {},
      onError = () => {},
      useEpisodate = true,
    }: {
      method?: string;
      params?: Record<string, string>;
      onSuccess?: (data: any) => void;
      onError?: () => void;
      useEpisodate?: boolean;
    }
  ) {
    method || setLoading(true);
    try {
      const res = await (useEpisodate
        ? fetchFromEpisodate(endpoint, params ?? searchParams)
        : fetchFromAPI("liveseries/" + endpoint, { method }, logout, !method));
      const json = await res.json();
      if (res.ok) {
        onSuccess(json);
        if (method && endpoint.startsWith("liked-shows")) {
          // Liked shows endpoint was updated, refetch on next page load
          setUpdateDetected(true);
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
    method || setLoading(false);
  }

  const getClassName = (path?: string) =>
    (
      path
        ? location.pathname.startsWith("/liveseries/" + path)
        : ["/liveseries", "/liveseries/"].includes(location.pathname)
    )
      ? " active"
      : "";

  const context: OutletContext = {
    loading,
    fetchResource,
    likedShowIds,
    reloadSite,
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
        <nav className="liveseries-links serif flex">
          <Link className={"clickable nav-link" + getClassName()} to="">
            {data.liveSeries.home.title}
          </Link>
          <Link
            className={"clickable nav-link" + getClassName("search")}
            to="search"
          >
            {data.liveSeries.search.title}
          </Link>
          <Link
            className={"clickable nav-link" + getClassName("most-popular")}
            to="most-popular"
          >
            {data.liveSeries.mostPopular.title}
          </Link>
        </nav>
        <Outlet context={context} />
      </div>
    </>
  );
}

export const getLiveSeriesTitle = (
  data: Translation,
  page: keyof Omit<Translation["liveSeries"], "title" | "tvShowList">
) => `${data.liveSeries[page].title} – ${data.liveSeries.title}`;


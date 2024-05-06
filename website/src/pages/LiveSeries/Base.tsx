import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useSearchParams } from "react-router-dom";
import Modal from "../../components/Modal";
import { fetchFromAPI } from "../../misc/backend";
import { fetchFromEpisodate } from "../../misc/episodate";
import { StateSetter, User } from "../../misc/models";
import { Translation } from "../../misc/translations";
import "../../styles/liveseries.css";

type LikedShows = null | number[];

export type OutletContext = {
  loading: boolean;
  fetchResource: (
    endpoint: string,
    {
      method,
      onSuccess,
      onError,
      useEpisodate,
    }: {
      method?: string;
      onSuccess?: (data: any) => void;
      onError?: () => void;
      useEpisodate?: boolean;
    }
  ) => Promise<void>;
  likedShows: LikedShows;
  reloadSite: () => Promise<void>;
};

export default function Base({
  data,
  setUser,
  reloadSite,
}: {
  data: Translation;
  setUser: StateSetter<User | null>;
  reloadSite: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [likedShows, setLikedShows] = useState<LikedShows>(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (loading || likedShows) return;

    fetchResource("liked/personal", {
      onSuccess: setLikedShows,
      useEpisodate: false,
    });
  }, []);

  async function fetchResource(
    endpoint: string,
    {
      method,
      onSuccess = () => {},
      onError = () => {},
      useEpisodate = true,
    }: {
      method?: string;
      onSuccess?: (data: any) => void;
      onError?: () => void;
      useEpisodate?: boolean;
    }
  ) {
    method || setLoading(true);
    try {
      const res = await (useEpisodate
        ? fetchFromEpisodate(endpoint, searchParams)
        : fetchFromAPI("liveseries/" + endpoint, { method }, setUser, !method));
      const json = await res.json();
      if (res.ok) {
        onSuccess(json);
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
    likedShows,
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

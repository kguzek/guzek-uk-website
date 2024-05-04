import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TvShowPreviewList from "../../components/LiveSeries/TvShowPreviewList";
import LoadingScreen from "../../components/LoadingScreen";
import Modal from "../../components/Modal";
import { fetchFromEpisodate } from "../../misc/episodate";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle } from "./Base";

export default function MostPopular({ data }: { data: Translation }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const title = getLiveSeriesTitle(data, "mostPopular");

  useEffect(() => {
    setTitle(title);
  }, [data]);

  useEffect(() => {
    if (loading) return;

    fetchMostPopular();
  }, [searchParams]);

  async function fetchMostPopular() {
    setLoading(true);
    const params = Object.fromEntries(searchParams.entries());
    try {
      const res = await fetchFromEpisodate("most-popular", params);
      const json = await res.json();
      setLoading(false);
      if (res.ok) {
        setResults(json);
      } else {
        setModalMessage(
          `${res.status} ${res.statusText}: ${JSON.stringify(json)}`
        );
        setModalVisible(true);
      }
    } catch {
      setLoading(false);
      setSearchParams("");
      setModalMessage("A network error occurred while fetching the results.");
      setModalVisible(true);
    }
  }

  return (
    <>
      <Modal
        className="error"
        message={modalMessage}
        visible={modalVisible}
        onClick={() => setModalVisible(false)}
      />
      <h2>{title}</h2>
      {loading ? (
        <div className="centred">
          <LoadingScreen text={data.loading} />
        </div>
      ) : results ? (
        <TvShowPreviewList data={data} tvShows={results} />
      ) : null}
    </>
  );
}


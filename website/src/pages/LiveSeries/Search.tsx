import React, { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import InputBox from "../../components/Forms/InputBox";
import TvShowPreviewList from "../../components/LiveSeries/TvShowPreviewList";
import LoadingScreen from "../../components/LoadingScreen";
import Modal from "../../components/Modal";
import { fetchFromEpisodate } from "../../misc/episodate";
import { TvShowList } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle } from "./Base";

export default function Search({ data }: { data: Translation }) {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<null | TvShowList>(null);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q");
  const title = getLiveSeriesTitle(data, "search");
  const searchingLabel = `${data.liveSeries.search.searching} "${searchQuery}"`;
  const resultsLabel = `${data.liveSeries.search.results} "${searchQuery}"`;

  useEffect(() => {
    const newTitle = loading
      ? searchingLabel
      : searchQuery
      ? resultsLabel
      : title;
    setTitle(newTitle);
  }, [data, searchParams, loading]);

  useEffect(() => {
    if (loading || !searchQuery) return;

    fetchResults();
  }, [searchParams]);

  async function fetchResults() {
    setLoading(true);
    const params = Object.fromEntries(searchParams.entries());
    try {
      const res = await fetchFromEpisodate("search", params);
      const json = await res.json();
      setLoading(false);
      if (res.ok) {
        setResults(json);
      } else {
        setSearchParams("");
        setModalMessage(
          `${res.status} ${res.statusText}: ${JSON.stringify(json)}`
        );
        setModalVisible(true);
      }
    } catch {
      setLoading(false);
      setSearchParams("");
      setModalMessage(
        "A network error occurred while fetching the fetching the results."
      );
      setModalVisible(true);
    }
  }

  function submitForm(evt: FormEvent) {
    evt.preventDefault();
    const query = { q: inputValue.trim() };
    setSearchParams(query);
  }

  return (
    <>
      <Modal
        className="error"
        message={modalMessage}
        visible={modalVisible}
        onClick={() => setModalVisible(false)}
      />
      <h2>{!loading && searchQuery ? resultsLabel : title}</h2>
      {searchQuery ? (
        loading || !results ? (
          <div className="centred">
            <LoadingScreen text={searchingLabel} />
            <button
              role="button"
              className="btn"
              onClick={() => setSearchParams("")}
            >
              {data.liveSeries.search.cancel}
            </button>
          </div>
        ) : (
          <TvShowPreviewList data={data} tvShows={results} />
        )
      ) : (
        <form className="form-editor" onSubmit={submitForm}>
          <InputBox
            label={data.liveSeries.search.label}
            value={inputValue}
            setValue={setInputValue}
            required={true}
            placeholder={data.liveSeries.search.prompt}
            autofocus
          />
          <button className="btn" role="submit">
            {data.liveSeries.search.search}
          </button>
        </form>
      )}
    </>
  );
}


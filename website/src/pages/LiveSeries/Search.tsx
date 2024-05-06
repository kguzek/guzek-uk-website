import React, { FormEvent, useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import InputBox from "../../components/Forms/InputBox";
import TvShowPreviewList from "../../components/LiveSeries/TvShowPreviewList";
import LoadingScreen from "../../components/LoadingScreen";
import { TvShowList } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle, OutletContext } from "./Base";

export default function Search({ data }: { data: Translation }) {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<null | TvShowList>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q");
  const title = getLiveSeriesTitle(data, "search");
  const searchingLabel = `${data.liveSeries.search.searching} "${searchQuery}"`;
  const resultsLabel = `${data.liveSeries.search.results} "${searchQuery}"`;
  const { loading, fetchResource } = useOutletContext<OutletContext>();

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

    fetchResource("search", { onSuccess: setResults });
  }, [searchParams]);

  function submitForm(evt: FormEvent) {
    evt.preventDefault();
    const query = { q: inputValue.trim() };
    setSearchParams(query);
  }

  return (
    <>
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


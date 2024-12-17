import React, { FormEvent, useContext, useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import InputBox from "../../components/Forms/InputBox";
import TvShowPreviewList from "../../components/LiveSeries/TvShowPreviewList";
import { TvShowList } from "../../misc/models";
import { TranslationContext } from "../../misc/context";
import { setTitle } from "../../misc/util";
import { getLiveSeriesTitle, LiveSeriesOutletContext } from "./Base";

export default function Search() {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<null | TvShowList>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useContext(TranslationContext);
  const { fetchResource } = useOutletContext<LiveSeriesOutletContext>();

  const searchQuery = searchParams.get("q");
  const title = getLiveSeriesTitle("search");
  const resultsLabel = `${data.liveSeries.search.results} "${searchQuery}"`;

  useEffect(() => {
    const newTitle = searchQuery ? resultsLabel : title;
    setTitle(newTitle);
  }, [data, searchParams]);

  useEffect(() => {
    if (!searchQuery) return;
    fetchResource("search", { onSuccess: setResults });

    if (!results) return;
    const searchedPage = +(searchParams.get("page") ?? "");
    if (searchedPage === results.page) return;

    // Predictively update the page number in the old data
    setResults({ ...results, page: searchedPage });
  }, [searchParams]);

  function submitForm(evt: FormEvent) {
    evt.preventDefault();
    const query = { q: inputValue.trim() };
    setSearchParams(query);
    setResults(null);
  }

  return (
    <>
      <h2>{title}</h2>
      <form className="form-editor flex-column search" onSubmit={submitForm}>
        <InputBox
          label={data.liveSeries.search.label}
          type="search"
          value={inputValue}
          setValue={setInputValue}
          required={true}
          placeholder={data.liveSeries.search.prompt}
          autofocus
        />
        <button className="btn" role="submit" style={{ minWidth: "unset" }}>
          {data.liveSeries.search.search}
        </button>
      </form>
      {searchQuery && (
        <>
          <h3>{resultsLabel}</h3>
          <TvShowPreviewList tvShows={results ?? undefined} />
        </>
      )}
    </>
  );
}


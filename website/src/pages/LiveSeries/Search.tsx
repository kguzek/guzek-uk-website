import React, { FormEvent, useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import InputBox from "../../components/Forms/InputBox";
import TvShowPreviewList from "../../components/LiveSeries/TvShowPreviewList";
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
  const resultsLabel = `${data.liveSeries.search.results} "${searchQuery}"`;
  const { loading, fetchResource } = useOutletContext<OutletContext>();

  useEffect(() => {
    const newTitle = searchQuery ? resultsLabel : title;
    setTitle(newTitle);
  }, [data, searchParams, loading]);

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
      <h2>{searchQuery ? resultsLabel : title}</h2>
      {searchQuery ? (
        <TvShowPreviewList data={data} tvShows={results ?? undefined} />
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


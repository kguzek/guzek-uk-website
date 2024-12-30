"use client";

import React, { useEffect, useState } from "react";
import InputBox from "@/components/forms/input-box";
import TvShowPreviewList from "@/components/liveseries/tv-show-preview-list";
import { TvShowList } from "@/lib/models";
import { setTitle } from "@/lib/util";
import { getLiveSeriesTitle } from "@/app/liveseries/layout";
import { useTranslations } from "@/context/translation-context";
import { useSearchParams } from "next/navigation";
import { useLiveSeries } from "@/context/liveseries-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Search() {
  const [results, setResults] = useState<null | TvShowList>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useTranslations();
  const { fetchResource } = useLiveSeries();

  const searchQuery = searchParams.get("q");
  const [inputValue, setInputValue] = useState(searchQuery ?? "");
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

  function getSearchPath() {
    const query = new URLSearchParams({ q: inputValue.trim() });
    return `/liveseries/search?${query}`;
  }

  return (
    <>
      <h2>{title}</h2>
      <form
        className="form-editor flex-column search"
        onSubmit={(evt) => {
          evt.preventDefault();
          router.push(getSearchPath());
        }}
      >
        <InputBox
          label={data.liveSeries.search.label}
          type="search"
          value={inputValue}
          setValue={setInputValue}
          required={true}
          placeholder={data.liveSeries.search.prompt}
          autofocus
        />
        <Link
          href={getSearchPath()}
          role="submit"
          className="btn"
          style={{ minWidth: "unset" }}
        >
          {data.liveSeries.search.search}
        </Link>
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

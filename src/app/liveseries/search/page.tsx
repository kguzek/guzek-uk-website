"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InputBox from "@/components/forms/input-box";
import { useTranslations } from "@/context/translation-context";
import { SearchResults } from "./results";
import { getLiveSeriesTitle } from "../layout-client";

export default function Search() {
  const router = useRouter();
  const { data } = useTranslations();

  const [inputValue, setInputValue] = useState("");
  const title = getLiveSeriesTitle("search");

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
      <SearchResults />
    </>
  );
}

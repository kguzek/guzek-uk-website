"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Language } from "@/lib/enums";
import { InputBox } from "@/components/forms/input-box";
import { TRANSLATIONS } from "@/lib/translations";
import { getTitle } from "@/lib/util";

export function SearchForm({ userLanguage }: { userLanguage: Language }) {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();
  const data = TRANSLATIONS[userLanguage];

  function getSearchPath() {
    const trimmed = inputValue.trim();
    if (!trimmed) return "";
    return `/liveseries/search/${encodeURIComponent(trimmed)}/1`;
  }

  const path = getSearchPath();

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(data.liveSeries.search.title, data.liveSeries.title, false)}
      </h2>
      <form
        action="/liveseries/search"
        method="GET"
        className="form-editor items-center gap-4 sm:flex"
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
          name="q"
        />
        {path ? (
          <Link href={path} role="submit" className="btn">
            {data.liveSeries.search.search}
          </Link>
        ) : (
          <button className="btn w-full sm:w-[unset]">
            {data.liveSeries.search.search}
          </button>
        )}
      </form>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InputBox from "@/components/forms/input-box";
import { TRANSLATIONS } from "@/lib/translations";
import type { Language } from "@/lib/enums";

export function SearchForm({ userLanguage }: { userLanguage: Language }) {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();
  const data = TRANSLATIONS[userLanguage];

  function getSearchPath() {
    const trimmed = inputValue.trim();
    if (!trimmed) return "";
    const query = new URLSearchParams({ q: trimmed });
    return `/liveseries/search?${query}`;
  }

  const path = getSearchPath();

  return (
    <form
      className="form-editor flex items-center gap-4"
      onSubmit={(evt) => {
        evt.preventDefault();
        router.push(getSearchPath());
      }}
      action="/liveseries/search"
      method="get"
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
        <button className="btn">{data.liveSeries.search.search}</button>
      )}
    </form>
  );
}

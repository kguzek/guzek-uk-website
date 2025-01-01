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
    const query = new URLSearchParams({ q: inputValue.trim() });
    return `/liveseries/search?${query}`;
  }

  return (
    <form
      className="form-editor flex items-center gap-4"
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
  );
}

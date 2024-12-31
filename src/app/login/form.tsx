"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useFetch } from "@/context/fetch-context";
import { useModals } from "@/context/modal-context";
import InputBox from "@/components/forms/input-box";
import { LoadingButton } from "@/components/loading/loading-button";
import { TRANSLATIONS } from "@/lib/translations";
import type { Language } from "@/lib/types";

export function LogInForm({ userLanguage }: { userLanguage: Language }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchFromAPI } = useFetch();
  const { setModalError } = useModals();
  const router = useRouter();

  const data = TRANSLATIONS[userLanguage];

  async function handleLogin(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setModalError();
    setLoading(true);
    const body = {
      email,
      password,
    };
    let res;
    try {
      res = await fetchFromAPI("auth/tokens", { method: "POST", body });
    } catch (error) {
      setModalError(data.networkError);
      console.error(error);
      setLoading(false);
      return;
    }
    setLoading(false);
    if (res.ok) {
      router.push("/profile");
    } else {
      setModalError(data.profile.invalidCredentials);
    }
  }

  return (
    <form className="form-login" onSubmit={handleLogin}>
      <InputBox
        label={data.profile.formDetails.email}
        type="email"
        value={email}
        name="email"
        setValue={setEmail}
      />
      <InputBox
        label={data.profile.formDetails.password}
        type="password"
        value={password}
        name="password"
        setValue={setPassword}
      />
      {loading ? (
        <LoadingButton />
      ) : (
        <button type="submit" className="btn btn-submit">
          {data.profile.formDetails.login}
        </button>
      )}
    </form>
  );
}

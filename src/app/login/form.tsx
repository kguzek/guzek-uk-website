"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { InputBox } from "@/components/forms/input-box";
import { LoadingButton } from "@/components/loading/loading-button";
import { useModals } from "@/context/modal-context";
import { clientToApi } from "@/lib/backend/client";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";

export function LogInForm({ userLanguage }: { userLanguage: Language }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setModalError } = useModals();
  const router = useRouter();

  const data = TRANSLATIONS[userLanguage];

  async function handleLogin(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setModalError();
    setLoading(true);
    const body = {
      login,
      password,
    };
    const result = await clientToApi("auth/tokens", "", {
      method: "POST",
      body,
    });
    if (result.ok) {
      router.push("/profile");
      router.refresh();
      router.prefetch("/liveseries");
    } else {
      setLoading(false);
      setModalError(
        result.res?.status === 400
          ? data.profile.invalidCredentials
          : data.networkError,
      );
    }
  }

  return (
    <form
      action="https://auth.guzek.uk/auth/tokens"
      method="POST"
      className="form-login"
      onSubmit={handleLogin}
    >
      <InputBox
        label={data.profile.formDetails.loginPrompt}
        type="text"
        value={login}
        name="login"
        setValue={setLogin}
        autofocus
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

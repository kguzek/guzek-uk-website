"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import InputBox from "@/components/forms/input-box";
import { LoadingButton } from "@/components/loading/loading-button";
import { TRANSLATIONS } from "@/lib/translations";
import type { Language } from "@/lib/enums";
import { useModals } from "@/context/modal-context";
import { clientToApi } from "@/lib/backend/client";

export function LogInForm({ userLanguage }: { userLanguage: Language }) {
  const [email, setEmail] = useState("");
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
      email,
      password,
    };
    let result;
    result = await clientToApi("auth/tokens", "", {
      method: "POST",
      body,
    });
    setLoading(false);
    if (result.ok) {
      router.push("/profile");
      router.refresh();
      router.prefetch("/liveseries");
    } else {
      setModalError(
        result.res?.status === 400
          ? data.profile.invalidCredentials
          : data.networkError,
      );
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

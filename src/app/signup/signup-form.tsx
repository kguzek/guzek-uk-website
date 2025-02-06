"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { InputBox } from "@/components/forms/input-box";
import { LoadingButton } from "@/components/loading/loading-button";
import { useModals } from "@/context/modal-context";
import { clientToApi } from "@/lib/backend/client";
import { TRANSLATIONS } from "@/lib/translations";
import type { Language } from "@/lib/enums";

export function SignUpForm({ userLanguage }: { userLanguage: Language }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setModalError } = useModals();

  const data = TRANSLATIONS[userLanguage];

  useEffect(() => {
    setModalError();
  }, [password, repeatPassword]);

  async function handleSignUp(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    if (password.length < 8) {
      setModalError(data.profile.passwordLength);
      return;
    }
    if (password !== repeatPassword) {
      setModalError(data.profile.passwordMismatch);
      return;
    }
    setModalError();
    setLoading(true);

    const body = {
      username,
      email,
      password,
    };
    const result = await clientToApi("auth/users", "", {
      method: "POST",
      body,
      userLanguage,
      setModalError,
    });
    setLoading(false);
    if (result.ok) {
      router.push("/profile");
      router.refresh();
      router.prefetch("/liveseries");
    }
  }

  return (
    <form
      action="https://auth.guzek.uk/auth/users"
      method="POST"
      className="form-login"
      onSubmit={handleSignUp}
    >
      <InputBox
        label={data.profile.formDetails.username}
        type="text"
        value={username}
        name="username"
        setValue={setUsername}
      />
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
      <InputBox
        label={data.profile.formDetails.passwordRepeat}
        type="password"
        value={repeatPassword}
        name="password2"
        setValue={setRepeatPassword}
      />
      {loading ? (
        <LoadingButton />
      ) : (
        <button type="submit" className="btn btn-submit">
          {data.profile.formDetails.signup}
        </button>
      )}
    </form>
  );
}

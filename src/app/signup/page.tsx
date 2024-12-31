"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import InputBox from "@/components/forms/input-box";
import { LoadingButton } from "@/components/loading-screen";
import { getErrorMessage, getUserFromResponse } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";
import { useAuth } from "@/context/auth-context";
import { useFetch } from "@/context/fetch-context";
import { useModals } from "@/context/modal-context";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data } = useTranslations();
  const { setUser } = useAuth();
  const { fetchFromAPI } = useFetch();
  const { setModalError } = useModals();

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
    setModalError("");
    setLoading(true);

    const body = {
      username,
      email,
      password,
    };
    let res;
    try {
      res = await fetchFromAPI("auth/users", { method: "POST", body });
    } catch (error) {
      console.error(error);
      setModalError(data.networkError);
      setLoading(false);
      return;
    }
    const json = await res.json();
    if (res.ok) {
      setUser(getUserFromResponse(json));
      router.push("/profile");
    } else {
      setModalError(getErrorMessage(res, json, data));
    }
    setLoading(false);
  }

  return (
    <div className="flex-column">
      <form className="form-login" onSubmit={handleSignUp}>
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
      <p>{data.profile.formDetails.haveAccountAlready}</p>
      <Link href="/login">
        <i>{data.profile.formDetails.login}</i>
      </Link>
    </div>
  );
}

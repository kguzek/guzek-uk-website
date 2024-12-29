import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import InputBox from "@/components/forms/input-box";
import LoadingScreen, { LoadingButton } from "@/components/loading-screen";
import { getUserFromResponse } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";
import { useAuth } from "@/context/auth-context";
import { useFetch } from "@/context/fetch-context";
import { useModals } from "@/context/modal-context";
import { useRouter } from "next/router";

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data } = useTranslations();
  const { user, setUser } = useAuth();
  const { fetchFromAPI } = useFetch();
  const { setModalError } = useModals();

  useEffect(() => {
    if (user) router.replace("/profile");
  }, [user]);

  async function handleLogin(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setModalError();
    setLoading(true);
    const body = {
      email,
      password,
    };
    const res = await fetchFromAPI("auth/tokens", { method: "POST", body });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setUser(getUserFromResponse(json));
    } else {
      setModalError(data.profile.invalidCredentials);
    }
  }

  return (
    <>
      {user ? (
        <LoadingScreen className="flex-column" text={data.profile.loading} />
      ) : (
        <>
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
          <div className="centred">
            <p>{data.profile.formDetails.or}</p>
            <Link href="/signup">
              <i>{data.profile.formDetails.signup}</i>
            </Link>
          </div>
        </>
      )}
    </>
  );
}

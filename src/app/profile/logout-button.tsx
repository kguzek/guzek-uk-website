"use client";

import { MouseEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch } from "@/context/fetch-context";
import { useModals } from "@/context/modal-context";
import { getErrorMessage } from "@/lib/util";
import { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { clearStoredLoginInfo } from "@/lib/backend";
import { LoadingButton } from "@/components/loading/loading-button";

export function LogoutButton({ userLanguage }: { userLanguage: Language }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const { fetchFromAPI } = useFetch();
  const { setModalError } = useModals();

  const data = TRANSLATIONS[userLanguage];

  async function handleLogOut(_evt: MouseEvent<HTMLButtonElement>) {
    setLoggingOut(true);
    let res;
    try {
      res = await fetchFromAPI(`auth/tokens`, { method: "DELETE" });
    } catch {
      setModalError(data.networkError);
      setLoggingOut(false);
      return;
    }
    setLoggingOut(false);
    if (!res.ok) {
      const json = await res.json();
      setModalError(getErrorMessage(res, json, data));
      return;
    }
    clearStoredLoginInfo();
    // TODO: implement logout via cookies
    // logout();
    router.push("/login");
  }

  return (
    <div className="flex justify-center">
      {loggingOut ? (
        <LoadingButton />
      ) : (
        <button className="btn btn-submit" onClick={handleLogOut}>
          {data.profile.formDetails.logout}
        </button>
      )}
    </div>
  );
}

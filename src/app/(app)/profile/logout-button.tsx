"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Language } from "@/lib/enums";
import { LoadingButton } from "@/components/loading/loading-button";
import { clientToApi } from "@/lib/backend/client";
import { useModals } from "@/lib/context/modal-context";
import { TRANSLATIONS } from "@/lib/translations";

export function LogoutButton({
  userLanguage,
  accessToken,
}: {
  userLanguage: Language;
  accessToken: string;
}) {
  const [loggingOut, setLoggingOut] = useState(false);
  const { setModalError } = useModals();
  const router = useRouter();

  const data = TRANSLATIONS[userLanguage];

  async function handleLogOut(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setLoggingOut(true);
    const result = await clientToApi("auth/tokens", accessToken, {
      method: "DELETE",
      userLanguage,
      setModalError,
    });
    setLoggingOut(false);
    if (result.ok) {
      router.refresh();
      router.push("/login");
    }
  }

  return (
    <form
      action="https://auth.guzek.uk/auth/tokens"
      method="post"
      onSubmit={handleLogOut}
      className="flex justify-center"
    >
      <input className="hidden" type="hidden" name="_method" value="DELETE" />
      {loggingOut ? (
        <LoadingButton />
      ) : (
        <button className="btn btn-submit" type="submit">
          {data.profile.formDetails.logout}
        </button>
      )}
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/loading/loading-button";
import { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { clientToApi } from "@/lib/backend/client";
import { useModals } from "@/context/modal-context";

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

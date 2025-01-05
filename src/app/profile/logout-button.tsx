"use client";

import { MouseEvent, useState } from "react";
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

  async function handleLogOut(_evt: MouseEvent<HTMLButtonElement>) {
    setLoggingOut(true);
    const result = await clientToApi(`auth/tokens`, accessToken, {
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

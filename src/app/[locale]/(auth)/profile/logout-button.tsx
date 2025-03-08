"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { fetchErrorToast } from "@/components/error/toast";
import { Button } from "@/components/ui/button";
import { fetchFromApi } from "@/lib/backend";

export function LogoutButton() {
  const { mutateAsync, isPending, isSuccess } = useMutation({ mutationFn: logOut });
  const router = useRouter();

  const t = useTranslations();

  async function logOut(event_: FormEvent<HTMLFormElement>) {
    event_.preventDefault();
    const result = await fetchFromApi("users/logout", {
      method: "POST",
    });
    console.info("Log out result:", result);
    router.push("/login");
    router.refresh();
  }

  return (
    <form
      action="/api/users/logout"
      method="POST"
      onSubmit={(event_) => {
        toast.promise(mutateAsync(event_), { error: fetchErrorToast(t("networkError")) });
      }}
    >
      <Button type="submit" loading={isPending} disabled={isSuccess} className="min-w-28">
        {t("profile.formDetails.logout")} <LogOut />
      </Button>
    </form>
  );
}

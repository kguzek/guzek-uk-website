"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import type { User } from "@/payload-types";
import { fetchErrorToast } from "@/components/error/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { showSuccessToast } from "@/components/ui/sonner";
import { getFormatters } from "@/i18n/request";
import { fetchFromApi } from "@/lib/backend";
import { removeUserCookie } from "@/lib/util";

export function DeleteAccountButton({ user }: { user: User }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const formatters = getFormatters(locale);
  const userString = `${formatters.quote(user.username)} <${user.email}>`;

  const { mutateAsync, isSuccess, isPending } = useMutation({
    mutationFn: deleteAccount,
  });

  async function deleteAccount() {
    closeDialog();
    const deletionResult = await fetchFromApi(`users/${user.id}`, { method: "DELETE" });
    console.info("Account deletion result:", deletionResult.data);

    try {
      const logoutResult = await fetchFromApi("users/logout", {
        method: "POST",
      });
      console.info("Log out result:", logoutResult);
    } catch (error) {
      console.warn("Error logging out:", error);
    }
    removeUserCookie();

    router.push("/");
    router.refresh();
    showSuccessToast(t("profile.formDetails.delete.success"));
  }

  function closeDialog() {
    setIsDialogOpen(false);
  }

  return (
    <AlertDialog open={isDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          disabled={isSuccess}
          loading={isPending}
          variant="destructive"
          onClick={() => {
            setIsDialogOpen(true);
          }}
          className="group min-w-14"
        >
          {t("profile.formDetails.delete.label")}{" "}
          <Trash2 className="transition-opacity duration-300 group-hover:opacity-80" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("profile.formDetails.delete.confirmation")}
          </AlertDialogTitle>
          <AlertDialogDescription asChild className="space-y-3">
            <div>
              <p>{t("modal.warnIrreversible")}</p>
              <p>
                {t("profile.formDetails.delete.currentUser")} {userString}.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDialog} variant="outline">
            {t("modal.no")}
          </AlertDialogCancel>
          <AlertDialogAction asChild variant="super-destructive">
            <Button
              variant="super-destructive"
              onClick={() => {
                toast.promise(mutateAsync, { error: fetchErrorToast(t("networkError")) });
              }}
            >
              {t("modal.yes")}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

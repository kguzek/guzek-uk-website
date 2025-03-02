"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Language } from "@/lib/enums";
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
import { fetchFromApi } from "@/lib/backend";
import { TRANSLATIONS } from "@/lib/translations";
import { removeUserCookie } from "@/lib/util";

export function DeleteAccountButton({
  user,
  userLanguage,
}: {
  user: User;
  userLanguage: Language;
}) {
  const data = TRANSLATIONS[userLanguage];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const userString = `${data.format.quote(user.username)} <${user.email}>`;

  const { mutateAsync, isSuccess, isPending } = useMutation({
    mutationFn: deleteAccount,
  });

  async function deleteAccount() {
    closeDialog();
    const deletionResult = await fetchFromApi(`users/${user.id}`, { method: "DELETE" });
    console.info("Account deletion result:", deletionResult.data);

    const logoutResult = await fetchFromApi("users/logout", {
      method: "POST",
    });
    console.info("Log out result:", logoutResult);
    removeUserCookie();

    router.push("/");
    router.refresh();
    showSuccessToast(data.profile.formDetails.delete.success);
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
          className="min-w-14"
        >
          {data.profile.formDetails.delete.label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {data.profile.formDetails.delete.confirmation}
          </AlertDialogTitle>
          <AlertDialogDescription asChild className="space-y-3">
            <div>
              <p>{data.modal.warnIrreversible}</p>
              <p>{data.profile.formDetails.delete.currentUser(userString)}.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDialog} variant="outline">
            {data.modal.no}
          </AlertDialogCancel>
          <AlertDialogAction asChild variant="super-destructive">
            <Button
              variant="super-destructive"
              onClick={() => {
                toast.promise(mutateAsync, { error: fetchErrorToast(data) });
              }}
            >
              {data.modal.yes}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

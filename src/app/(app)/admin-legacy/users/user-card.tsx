"use client";

import Link from "next/link";
import { useState } from "react";
import { SettingsIcon, Trash2Icon, UserIcon } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { User } from "@/lib/types";
import { clientToApi } from "@/lib/backend/client";
import { useModals } from "@/lib/context/modal-context";
import { TRANSLATIONS } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function UserCard({
  user,
  userLanguage,
  accessToken,
}: {
  user: User;
  userLanguage: Language;
  accessToken: string;
}) {
  const { setModalChoice, setModalError, setModalInfo } = useModals();
  const [isDeleted, setIsDeleted] = useState(false);

  const data = TRANSLATIONS[userLanguage];

  async function confirmDelete(user: User) {
    const primary = await setModalChoice(data.admin.users.confirmDelete);
    if (!primary) return;
    await deleteUser(user);
  }

  async function deleteUser(user: User) {
    const res = await clientToApi(`auth/users/${user.uuid}`, accessToken, {
      method: "DELETE",
      userLanguage,
      setModalError,
    });
    if (res.ok) {
      setModalInfo(data.admin.users.deleted(user.username));
      setIsDeleted(true);
    }
  }

  if (isDeleted) return null;
  return (
    <div className="bg-primary flex w-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:opacity-100 lg:opacity-70">
      <Link
        href={`/admin-legacy/users/${user.uuid}`}
        className="group text-background flex w-full items-center gap-5 px-2 py-3 sm:px-3"
      >
        <UserIcon className={cn({ "text-accent": user.admin })}></UserIcon>
        <div>
          <i>{user.username}</i>
          <div className="font-normal">{user.email}</div>
        </div>
        <SettingsIcon className="ml-auto scale-75 transition-transform duration-300 group-hover:rotate-180 sm:scale-100" />
      </Link>
      <div className="delete" onClick={() => confirmDelete(user)}>
        <Trash2Icon className="scale-75 sm:scale-100" />
      </div>
    </div>
  );
}

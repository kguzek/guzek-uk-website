"use client";

import { useState } from "react";
import Link from "next/link";
import { SettingsIcon, Trash2Icon, UserIcon } from "lucide-react";
import { useModals } from "@/context/modal-context";
import { clientToApi } from "@/lib/backend/client";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import type { User } from "@/lib/types";
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
    <div className="flex w-full overflow-hidden rounded-2xl bg-primary text-background transition-all duration-300 hover:-translate-y-1 hover:opacity-100 lg:opacity-70">
      <Link
        href={`/admin/users/${user.uuid}`}
        className="card group flex items-center gap-5"
      >
        <UserIcon className={cn({ "text-accent": user.admin })}></UserIcon>
        <div>
          <i>{user.username}</i>
          <div className="font-normal">{user.email}</div>
        </div>
        <SettingsIcon className="ml-auto transition-transform group-hover:rotate-180" />
      </Link>
      <div className="delete" onClick={() => confirmDelete(user)}>
        <Trash2Icon />
      </div>
    </div>
  );
}

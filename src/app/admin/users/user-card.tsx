"use client";

import { useModals } from "@/context/modal-context";
import { clientToApi } from "@/lib/backend/client";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import type { User } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

export function UserCard({
  user,
  userLanguage,
}: {
  user: User;
  userLanguage: Language;
}) {
  const { setModalChoice, setModalInfo } = useModals();
  const [isDeleted, setIsDeleted] = useState(false);

  const data = TRANSLATIONS[userLanguage];

  async function confirmDelete(user: User) {
    const primary = await setModalChoice(data.admin.users.confirmDelete);
    if (!primary) return;
    await deleteUser(user);
  }

  async function deleteUser(user: User) {
    const res = await clientToApi(`auth/users/${user.uuid}`, userLanguage, {
      method: "DELETE",
    });
    if (res.ok) {
      setModalInfo(data.admin.users.deleted(user.username));
      setIsDeleted(true);
    }
  }

  if (isDeleted) return null;
  return (
    <div className="clickable card-container overflow-hidden">
      <Link
        href={`/admin/users/${user.uuid}`}
        className="card group flex items-center gap-5"
      >
        <i className={`fa-solid fa-user ${user.admin ? "admin" : ""}`}></i>
        <div>
          <div className="flex">
            <i>{user.username}</i>
          </div>
          <div className="fontserif font-normal">{user.email}</div>
        </div>
        <i className="fa-solid fa-gear transition-transform group-hover:rotate-180"></i>
      </Link>
      <div className="delete" onClick={() => confirmDelete(user)}>
        <i className="fa-solid fa-trash"></i>
      </div>
    </div>
  );
}

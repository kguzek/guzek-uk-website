"use client";

import { useFetch } from "@/context/fetch-context";
import { useModals } from "@/context/modal-context";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import type { User } from "@/lib/types";
import { getErrorMessage } from "@/lib/util";
import Link from "next/link";
import { useState } from "react";

export function UserCard({
  user,
  userLanguage,
}: {
  user: User;
  userLanguage: Language;
}) {
  const { setModalChoice, setModalError, setModalInfo } = useModals();
  const [deleted, setDeleted] = useState(false);
  const { fetchFromAPI } = useFetch();

  const data = TRANSLATIONS[userLanguage];

  async function confirmDelete(user: User) {
    const primary = await setModalChoice(data.admin.users.confirmDelete);
    if (!primary) return;
    await deleteUser(user);
  }

  async function deleteUser(user: User) {
    try {
      const res = await fetchFromAPI(`auth/users/${user.uuid}`, {
        method: "DELETE",
      });
      if (!res) throw new Error("Beep boop 123");
      if (res.ok) {
        setModalInfo(data.admin.users.deleted(user.username));
        setDeleted(true);
      } else {
        const json = await res.json();
        setModalError(getErrorMessage(res, json, data));
      }
    } catch (error) {
      console.error(error);
      setModalError(data.networkError);
    }
  }

  if (deleted) return null;
  return (
    <div className="clickable card-container overflow-hidden">
      <Link href={user.uuid!} className="card group flex items-center gap-5">
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

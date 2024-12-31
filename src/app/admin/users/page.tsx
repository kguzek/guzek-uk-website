"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LoadingScreen } from "@/components/loading/screen";
import { User } from "@/lib/types";
import { getErrorMessage } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";
import { useModals } from "@/context/modal-context";
import { useFetch } from "@/context/fetch-context";
import { useAdmin } from "@/context/admin-context";

export default function Users() {
  const { data } = useTranslations();
  const { setModalChoice, setModalError, setModalInfo } = useModals();
  const { fetchFromAPI } = useFetch();
  const { users, setUsers, setTitle } = useAdmin();

  useEffect(() => {
    setTitle(data.admin.users.title);
  }, []);

  // TODO: change to skeleton
  if (!users) return <LoadingScreen />;

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
      if (res.ok) {
        setModalInfo(data.admin.users.deleted(user.username));
        setUsers(
          (old) => old?.filter((some) => some.uuid !== user.uuid) ?? null
        );
      } else {
        const json = await res.json();
        setModalError(getErrorMessage(res, json, data));
      }
    } catch (error) {
      console.error(error);
      setModalError(data.networkError);
    }
  }

  return (
    <div>
      <h3>{data.admin.users.title}</h3>
      <div className="users flex-column">
        <div className="cards flex-column gap-10">
          {users.map((user, idx) => (
            <div key={idx} className="clickable card-container no-overflow">
              <Link href={user.uuid!} className="card user flex gap-15">
                <i
                  className={`fa-solid fa-user ${user.admin ? "admin" : ""}`}
                ></i>
                <div>
                  <div className="flex">
                    <i>{user.username}</i>
                  </div>
                  <div className="serif regular">{user.email}</div>
                </div>
                <i className="fa-solid fa-gear"></i>
              </Link>
              <div className="delete" onClick={() => confirmDelete(user)}>
                <i className="fa-solid fa-trash"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MiniNavBar } from "@/components/navigation/navigation-bar";
import { StateSetter, User } from "@/lib/models";
import { setTitle } from "@/lib/util";
import { useTranslations } from "@/context/translation-context";
import { useFetch } from "@/context/fetch-context";
import "./admin.css";

export interface AdminContext {
  users: User[] | null;
  setUsers: StateSetter<User[] | null>;
  setTitle: (title: string) => void;
}

export default function AdminBase() {
  const [users, setUsers] = useState<User[] | null>(null);
  const router = useRouter();
  const { data } = useTranslations();
  const { tryFetch } = useFetch();

  useEffect(() => {
    if (users) return;
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!["/admin", "/admin/"].includes(router.pathname)) return;
    setTitle(data.admin.title);
  }, [router.pathname, data]);

  async function fetchUsers() {
    const res = await tryFetch("auth/users", {}, [] as User[], true);
    setUsers(res);
  }

  const context: AdminContext = {
    users,
    setUsers,
    setTitle: (title) => setTitle(`${title} –  ${data.admin.title}`),
  };

  return (
    <div className="text">
      <MiniNavBar
        pathBase="admin"
        pages={[
          { link: "content-manager", label: data.admin.contentManager.title },
          { link: "users", label: data.admin.users.title },
          { link: "logs", label: data.admin.logs.title },
        ]}
      />
      <h2>{data.admin.title}</h2>
      <Outlet context={context} />
    </div>
  );
}

import React, { useContext, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MiniNavBar } from "../../components/Navigation/NavigationBar";
import { TranslationContext, useFetchContext } from "../../misc/context";
import { StateSetter, User } from "../../misc/models";
import { setTitle } from "../../misc/util";
import "./Admin.css";

export interface AdminContext {
  users: User[] | null;
  setUsers: StateSetter<User[] | null>;
  setTitle: (title: string) => void;
}

export default function AdminBase() {
  const data = useContext(TranslationContext);
  const [users, setUsers] = useState<User[] | null>(null);
  const { tryFetch } = useFetchContext();
  const location = useLocation();

  useEffect(() => {
    if (users) return;
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!["/admin", "/admin/"].includes(location.pathname)) return;
    setTitle(data.admin.title);
  }, [location]);

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


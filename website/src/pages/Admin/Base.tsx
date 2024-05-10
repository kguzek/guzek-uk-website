import React, { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { MiniNavBar } from "../../components/Navigation/NavigationBar";
import { TranslationContext, useFetchContext } from "../../misc/context";
import { StateSetter, User } from "../../misc/models";
import "./Admin.css";

export interface AdminContext {
  users: User[] | null;
  setUsers: StateSetter<User[] | null>;
}

export default function AdminBase() {
  const data = useContext(TranslationContext);
  const [users, setUsers] = useState<User[] | null>(null);
  const { tryFetch } = useFetchContext();

  useEffect(() => {
    if (users) return;
    fetchUsers();
  });

  async function fetchUsers() {
    const res = await tryFetch("auth/users", {}, [] as User[], true);
    setUsers(res);
  }

  const context: AdminContext = { users, setUsers };

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


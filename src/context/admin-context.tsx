"use client";

import { StateSetter, User } from "@/lib/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslations } from "./translation-context";
import { useFetch } from "./fetch-context";
import { setTitle } from "@/lib/util";
import { usePathname } from "next/navigation";

interface AdminContextType {
  users: User[] | null;
  setUsers: StateSetter<User[] | null>;
  setTitle: (title: string) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider.");
  }
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[] | null>(null);
  const pathname = usePathname();
  const { data } = useTranslations();
  const { tryFetch } = useFetch();

  useEffect(() => {
    if (users) return;
    fetchUsers();
  }, []);

  useEffect(() => {
    if (pathname != null && !["/admin", "/admin/"].includes(pathname)) return;
    setTitle(data.admin.title);
  }, [pathname, data]);

  async function fetchUsers() {
    const res = await tryFetch("auth/users", {}, [] as User[], true);
    setUsers(res);
  }

  const context: AdminContextType = {
    users,
    setUsers,
    setTitle: (title) => setTitle(`${title} –  ${data.admin.title}`),
  };

  return (
    <AdminContext.Provider value={context}>{children}</AdminContext.Provider>
  );
}

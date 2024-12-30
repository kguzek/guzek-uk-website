"use client";

import { ReactNode } from "react";
import { MiniNavBar } from "@/components/navigation/navigation-bar";
import ErrorPage from "@/components/error-page";
import { ErrorCode, StateSetter, User } from "@/lib/models";
import { useTranslations } from "@/context/translation-context";
import { AdminProvider } from "@/context/admin-context";
import { useAuth } from "@/context/auth-context";
import "./admin.css";

export interface AdminContext {
  users: User[] | null;
  setUsers: StateSetter<User[] | null>;
  setTitle: (title: string) => void;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data } = useTranslations();
  const { user } = useAuth();

  if (user === undefined) {
    return (
      <div className="flex-column">
        <h3>Validating permissions...</h3>
      </div>
    );
  }

  if (!user?.admin) {
    return <ErrorPage errorCode={ErrorCode.Forbidden} />;
  }

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
      <AdminProvider>{children}</AdminProvider>
    </div>
  );
}

import { ReactNode } from "react";
import { MiniNavBar } from "@/components/navigation/navigation-bar-client";
import { ErrorComponent } from "@/components/error-component";
import { ErrorCode, StateSetter, User } from "@/lib/types";
import { AdminProvider } from "@/context/admin-context";
import { useTranslations } from "@/providers/translation-provider";
import { getCurrentUser } from "@/providers/auth-provider";
import "./admin.css";

export interface AdminContext {
  users: User[] | null;
  setUsers: StateSetter<User[] | null>;
  setTitle: (title: string) => void;
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data } = await useTranslations();
  const user = await getCurrentUser();

  if (user === undefined) {
    return (
      <div className="flex-column">
        <h3>Validating permissions...</h3>
      </div>
    );
  }

  if (!user?.admin) {
    return <ErrorComponent errorCode={ErrorCode.Forbidden} />;
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

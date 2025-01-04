import { ReactNode } from "react";
import { MiniNavBar } from "@/components/navigation/navigation-bar-client";
import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/enums";
import { useTranslations } from "@/providers/translation-provider";
import { getCurrentUser } from "@/lib/backend/user";
import "./admin.css";

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
      <h2 className="my-6 text-3xl font-bold">{data.admin.title}</h2>
      {children}
    </div>
  );
}

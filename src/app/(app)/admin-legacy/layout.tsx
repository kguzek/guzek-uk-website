import type { ReactNode } from "react";

import { ErrorComponent } from "@/components/error-component";
import { MiniNavBar } from "@/components/navigation/navigation-bar-client";
import { ErrorCode } from "@/lib/enums";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data } = await getTranslations();
  const { user } = await getAuth();

  if (!user?.admin) {
    return <ErrorComponent errorCode={ErrorCode.Forbidden} />;
  }

  return (
    <div className="text">
      <MiniNavBar
        pathBase="admin"
        pages={[
          // { link: "content-manager", label: data.admin.contentManager.title },
          { link: "users", label: data.admin.users.title },
          { link: "logs", label: data.admin.logs.title },
        ]}
      />
      <h2 className="my-6 text-3xl font-bold">{data.admin.title}</h2>
      {children}
    </div>
  );
}

import { Metadata } from "next";
import type { User } from "@/lib/types";
import { useTranslations } from "@/providers/translation-provider";
import { getAccessToken, serverToApi } from "@/lib/backend/server";
import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/enums";
import { UserCard } from "./user-card";
import { getTitle } from "@/lib/util";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await useTranslations();
  return {
    title: getTitle(data.admin.users.title),
  };
}

export default async function Users() {
  const { data, userLanguage } = await useTranslations();
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return <ErrorComponent errorCode={ErrorCode.Unauthorized} />;
  }

  const usersResult = await serverToApi<User[]>("auth/users");
  if (!usersResult.ok) {
    return <ErrorComponent errorCode={ErrorCode.Forbidden} />;
  }

  return (
    <div>
      <h3 className="my-5 text-2xl font-bold">{data.admin.users.title}</h3>
      <div className="users flex-column">
        <div className="cards flex-column gap-4">
          {usersResult.data.map((user, key) => (
            <UserCard
              key={`user-${user.uuid || key}`}
              user={user}
              userLanguage={userLanguage}
              accessToken={accessToken}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

import type { User } from "@/lib/types";
import { ErrorComponent } from "@/components/error/component";
import { serverToApi } from "@/lib/backend/server";
import { ErrorCode } from "@/lib/enums";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle } from "@/lib/util";

import { UserCard } from "./user-card";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.admin.users.title),
  };
}

export default async function Users() {
  const { data, userLanguage } = await getTranslations();
  const { accessToken } = await getAuth();

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
        <div className="flex-column w-full gap-4 text-xs sm:w-[90%] sm:text-base md:w-4/5">
          {usersResult.data.map((user, key) => (
            <UserCard
              key={`user-${user.id || key}`}
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

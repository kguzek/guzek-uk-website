import { ErrorComponent } from "@/components/error-component";
import type { User } from "@/lib/types";
import { getTitle } from "@/lib/util";
import { getAccessToken, serverToApi } from "@/lib/backend/server";
import { useTranslations } from "@/providers/translation-provider";
import { UserEditor } from "./user-editor";
import { ErrorCode } from "@/lib/enums";

interface Props {
  params: Promise<{ uuid: string }>;
}

export async function generateMetadata(
  props: Props,
): Promise<{ title: string }> {
  const result = await fetchUserFromProps(props);
  if (!result?.data) return { title: getTitle("User ???") };
  const [user] = result.data;
  return { title: getTitle(`@${user.username}`) };
}

async function fetchUserFromProps(props: Props) {
  const { params } = props;
  const { uuid } = await params;
  if (!uuid) return null;
  const result = await serverToApi<User[]>(`auth/users/${uuid}`);
  return result;
}

export default async function UserPage(props: Props) {
  const { userLanguage } = await useTranslations();
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return <ErrorComponent errorCode={ErrorCode.Unauthorized} />;
  }
  const result = await fetchUserFromProps(props);
  if (!result) return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  if (!result.ok) return <ErrorComponent errorResult={result} />;
  const [user] = result.data;
  return (
    <div className="flex w-full justify-center">
      <UserEditor
        user={user}
        userLanguage={userLanguage}
        accessToken={accessToken}
      />
    </div>
  );
}

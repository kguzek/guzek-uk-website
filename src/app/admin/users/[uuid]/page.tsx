import { ErrorComponent } from "@/components/error-component";
import type { User } from "@/lib/types";
import { getTitle } from "@/lib/util";
import { serverToApi } from "@/lib/backend/server";
import { useTranslations } from "@/providers/translation-provider";
import { UserEditor } from "./user-editor";

interface Props {
  params: Promise<{ uuid: string }>;
}

export async function generateMetadata(): Promise<{ title: string }> {
  // TODO: Implement
  return { title: getTitle("@user") };
}

export default async function UserPage({ params }: Props) {
  const { userLanguage } = await useTranslations();
  const { uuid } = await params;
  const result = await serverToApi<User>(`auth/users/${uuid}`);
  if (!result.ok) {
    return <ErrorComponent errorResult={result} />;
  }

  return <UserEditor user={result.data} userLanguage={userLanguage} />;
}

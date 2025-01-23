import { useAuth } from "@/lib/backend/user";
import { useTranslations } from "@/providers/translation-provider";
import { ProfileForm } from "./profile-form";
import { LogoutButton } from "./logout-button";
import { PageSkeleton } from "@/components/pages/skeleton";
import { getTitle } from "@/lib/util";

export async function generateMetadata() {
  const { data } = await useTranslations();
  return {
    title: getTitle(data.profile.title),
  };
}

export default async function Profile() {
  const { user, accessToken } = await useAuth();
  const { data, userLanguage } = await useTranslations();

  if (!user || !accessToken)
    return (
      <div className="text">
        <PageSkeleton />
      </div>
    );

  return (
    <div className="text">
      <h2 className="my-6 text-3xl font-bold">{data.profile.title}</h2>
      <h3 className="my-5 text-2xl font-bold">{data.profile.body}</h3>
      <main className="space-y-3">
        <p>
          {data.profile.formDetails.type}:{" "}
          <span className="clickable genre">
            {
              data.profile.formDetails[
                user.admin ? "administrator" : "regularUser"
              ]
            }
          </span>
        </p>
        <p>
          {data.profile.formDetails.username}:{" "}
          <span className="clickable genre">{user.username}</span>
        </p>
        <p>
          {data.profile.formDetails.email}:{" "}
          <span className="clickable genre">{user.email}</span>
        </p>
        <ProfileForm
          user={user}
          userLanguage={userLanguage}
          accessToken={accessToken}
        />
        <div>
          {/* TODO: make uuid and created_at always available */}
          {user.uuid && (
            <p>
              <small>
                UUID: <code className="clickable field">{user.uuid}</code>
              </small>
            </p>
          )}
          {user.created_at ? (
            <p>
              <small>
                {data.profile.formDetails.creationDate}:{" "}
                <code className="clickable field">
                  {data.dateTimeFormat.format(new Date(user.created_at))}
                </code>
              </small>
            </p>
          ) : null}
        </div>
        <LogoutButton userLanguage={userLanguage} accessToken={accessToken} />
      </main>
    </div>
  );
}

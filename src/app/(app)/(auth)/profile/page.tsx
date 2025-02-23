import { PageSkeleton } from "@/components/pages/skeleton";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle } from "@/lib/util";

import { LogoutButton } from "./logout-button";
import { ProfileForm } from "./profile-form";

export async function generateMetadata() {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.profile.title),
  };
}

export default async function Profile() {
  const { user, accessToken } = await getAuth();
  const { data, userLanguage } = await getTranslations();

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
      <div className="space-y-3">
        <p>
          {data.profile.formDetails.type}:{" "}
          <span className="clickable genre">
            {
              data.profile.formDetails[
                user.role === "admin" ? "administrator" : "regularUser"
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
        <ProfileForm user={user} userLanguage={userLanguage} accessToken={accessToken} />
        <div>
          {/* TODO: make uuid and created_at always available */}
          {user.id && (
            <p>
              <small>
                UUID: <code className="clickable field">{user.id}</code>
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
      </div>
    </div>
  );
}

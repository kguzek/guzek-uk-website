import { PageTitle } from "@/components/page-title";
import { getCurrentUser } from "@/providers/auth-provider";
import { useTranslations } from "@/providers/translation-provider";
import { ProfileForm } from "./profile-form";
import { LogoutButton } from "./logout-button";
import { PageSkeleton } from "@/components/pages/skeleton";

export default async function Profile() {
  const user = await getCurrentUser();
  const { data, userLanguage } = await useTranslations();

  if (!user) return <PageSkeleton />;

  return (
    <div className="text profile-page">
      <PageTitle title={data.profile.title} />
      <h3>{data.profile.body}</h3>
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
      <ProfileForm user={user} />
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
      <LogoutButton userLanguage={userLanguage} />
    </div>
  );
}

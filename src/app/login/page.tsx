import Link from "next/link";
import { LoadingScreen } from "@/components/loading/screen";
import { useTranslations } from "@/providers/translation-provider";
import { useAuth } from "@/providers/auth-provider";
import { LogInForm } from "./form";

export default async function LogIn() {
  const { data, userLanguage } = await useTranslations();
  const { user } = await useAuth();

  return (
    <>
      {user ? (
        <LoadingScreen className="flex-column" text={data.profile.loading} />
      ) : (
        <>
          <LogInForm userLanguage={userLanguage} />
          <div className="centred">
            <p>{data.profile.formDetails.or}</p>
            <Link href="/signup">
              <i>{data.profile.formDetails.signup}</i>
            </Link>
          </div>
        </>
      )}
    </>
  );
}

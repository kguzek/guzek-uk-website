import { Glow } from "@codaworks/react-glow";
import { FlaskConical, Info } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/image/logo";
import { Link } from "@/i18n/navigation";
import { GITHUB_URL } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/alert-dialog";

const TV_MAZE_URL = "https://www.tvmaze.com/";

const REPO_NAME = "guzek-uk-website";

const BETA_INFO = {
  enabled: false,
  url: `${GITHUB_URL}/${REPO_NAME}/pull/18`,
  label: "PayloadCMS",
};

export async function Footer() {
  const t = await getTranslations();
  const version = process.env.npm_package_version;
  const versionSpan = version ? <span>v{version}</span> : null;
  return (
    <footer className="py-4">
      <Glow>
        <hr className="border-background glow:border-accent/70" />
      </Glow>
      <div className="mt-4 flex flex-col items-center justify-center gap-3 text-xs sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo size={20} />
          <Link className="hover-underline" href={GITHUB_URL} target="_blank">
            2021–2025 &copy; Konrad Guzek
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {BETA_INFO.enabled ? (
            <>
              {versionSpan}
              <Link href={BETA_INFO.url} className="group flex items-center gap-1">
                <FlaskConical
                  size={20}
                  className="scale-85 transition-transform duration-300 group-hover:scale-100"
                />
                <span className="hover-underline group-hover:underlined text-primary group-hover:text-primary-strong text-xs">
                  {BETA_INFO.label}
                </span>
              </Link>
            </>
          ) : (
            <Link
              href={`${GITHUB_URL}/${REPO_NAME}`}
              className="hover-underline text-primary hover:text-primary-strong flex items-center gap-1"
            >
              <span>main</span>
              {versionSpan}
            </Link>
          )}
          <AlertDialog>
            <AlertDialogTrigger className="group flex cursor-help items-center gap-1">
              {/* <Tv2
                size={20}
                className="scale-85 transition-transform duration-300 group-hover:scale-100"
              /> */}
              <span>TVmaze.com</span>
              <Info size={16} />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>LiveSeries &times; TVmaze</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <p>{t("liveSeries.tvMazeCredits")}</p>
                    <p>
                      {t("liveSeries.tvMazeCreditsCta")}{" "}
                      <Link className="text-accent hover-underline" href={TV_MAZE_URL}>
                        {TV_MAZE_URL}
                      </Link>
                      .
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Ok</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </footer>
  );
}

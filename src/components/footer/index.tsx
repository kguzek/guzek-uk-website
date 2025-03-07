import Link from "next/link";
import { Glow } from "@codaworks/react-glow";
import { FlaskConical, Info } from "lucide-react";

import { Logo } from "@/components/image/logo";
import { GITHUB_URL } from "@/lib/constants";
import { getTranslations } from "@/lib/providers/translation-provider";
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

const BETA_INFO = {
  enabled: false,
  url: `${GITHUB_URL}/guzek-uk-website/pull/18`,
  label: "PayloadCMS",
};

export async function Footer() {
  const { data } = await getTranslations();
  const version = process.env.npm_package_version;
  return (
    <footer className="py-4">
      <Glow>
        <hr className="border-background glow:border-accent/70" />
      </Glow>
      <div className="mt-4 flex flex-col items-center justify-center gap-3 text-xs sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo size={20} />
          <small>
            <Link
              className="hover-underline text-xs"
              href={GITHUB_URL}
              target="_blank"
              rel="me"
            >
              {data.footer("2021–2025")}
            </Link>
          </small>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {BETA_INFO.enabled ? null : <span>main</span>}
            {version?.length !== 0 && <span>v{version}</span>}
          </div>
          {BETA_INFO.enabled ? (
            <Link href={BETA_INFO.url} className="group flex items-center gap-1">
              <FlaskConical
                size={20}
                className="scale-85 transition-transform duration-300 group-hover:scale-100"
              />
              <span className="hover-underline group-hover:underlined text-xs">
                {BETA_INFO.label}
              </span>
            </Link>
          ) : null}
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
                    <p>{data.liveSeries.tvMazeCredits}</p>
                    <p>
                      {data.liveSeries.tvMazeCreditsCta}{" "}
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

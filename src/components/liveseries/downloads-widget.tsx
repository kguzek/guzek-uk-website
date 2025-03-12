"use client";

import { useEffect, useState } from "react";
import { ChevronUpIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { DownloadedEpisode } from "@/lib/types";
import type { User } from "@/payload-types";
import { Link } from "@/i18n/navigation";
import { getFormatters } from "@/i18n/request";
import { fetchFromApi } from "@/lib/backend";
import { useLiveSeriesContext } from "@/lib/context/liveseries-context";
import { DownloadStatus } from "@/lib/enums";
import { bytesToReadable, getDuration } from "@/lib/util";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { showInfoToast, showSuccessToast } from "@/ui/sonner";

import { showErrorToast, showFetchErrorToast } from "../error/toast";
import { Tile } from "../tile";

export function DownloadsWidget({
  user,
  accessToken,
}: {
  user: User;
  accessToken: string;
}) {
  const { downloadedEpisodes } = useLiveSeriesContext();
  const [collapsed, setCollapsed] = useState(
    downloadedEpisodes.find((episode) => episode.status === DownloadStatus.PENDING) ==
      null,
  );
  const [collapsedAnimated, setCollapsedAnimated] = useState(collapsed);
  const [isDeleteEpisodeDialogOpen, setIsDeleteEpisodeDialogOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<DownloadedEpisode | null>(null);
  const t = useTranslations();
  const locale = useLocale();
  const formatters = getFormatters(locale);

  function serialise(episode: DownloadedEpisode) {
    const episodeObject = { number: episode.episode, season: episode.season };
    const episodeSerialised = formatters.serialiseEpisode(episodeObject);
    return `${episode.showName} ${episodeSerialised}`;
  }

  function isUserServerUrlValid(user: User): user is User & { serverUrl: string } {
    if (user == null || accessToken == null) {
      showErrorToast(t("liveSeries.home.login"));
      return false;
    }
    if (user.serverUrl == null || user.serverUrl === "") {
      showInfoToast(t("liveSeries.setup"));
      return false;
    }
    return true;
  }

  function askDeleteEpisode(episode: DownloadedEpisode) {
    if (isUserServerUrlValid(user)) {
      setIsDeleteEpisodeDialogOpen(true);
      setEpisodeToDelete(episode);
    }
  }

  async function deleteEpisode(episode: DownloadedEpisode) {
    if (!isUserServerUrlValid(user)) {
      return;
    }
    try {
      await fetchFromApi(
        `liveseries/downloaded-episodes/${episode.showName}/${episode.season}/${episode.episode}`,
        { method: "DELETE", accessToken, urlBase: user.serverUrl },
      );
    } catch (error) {
      showFetchErrorToast(t("networkError"), error);
      return;
    }
    showSuccessToast(t("liveSeries.episodes.deleted", { episode: serialise(episode) }));
  }

  useEffect(() => {
    setTimeout(
      () => {
        setCollapsedAnimated(collapsed);
      },
      collapsed ? 0 : 300,
    );
  }, [collapsed]);

  function closeDeleteEpisodeDialog() {
    setIsDeleteEpisodeDialogOpen(false);
  }

  function getDeleteEpisodeConfirmationMessage(episode: DownloadedEpisode) {
    const formattedEpisode = formatters.quote(serialise(episode));
    return t("liveSeries.episodes.confirmDelete", { episode: formattedEpisode });
  }

  if (downloadedEpisodes.length === 0) return null;

  return (
    <Tile
      containerClassName={cn(
        "group fixed right-0 bottom-0 z-7 w-full sm:max-w-lg rounded-t-xl rounded-b-none border border-b-0 p-0 pl-2 shadow-lg sm:backdrop-blur-2xl transition-colors duration-300 sm:rounded-tr-none sm:border-r-0",
        {
          "bg-background-strong/70 sm:bg-background-strong/25 backdrop-blur-lg":
            collapsed,
          "bg-background-strong sm:bg-background-strong/70 sm:hover:bg-background-strong":
            !collapsed,
        },
      )}
      className="w-full p-0"
      variant="vanilla"
    >
      <AlertDialog
        open={isDeleteEpisodeDialogOpen}
        onOpenChange={setIsDeleteEpisodeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {episodeToDelete != null &&
                getDeleteEpisodeConfirmationMessage(episodeToDelete)}
            </AlertDialogTitle>
            <AlertDialogDescription>{t("modal.warnIrreversible")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" onClick={closeDeleteEpisodeDialog}>
              {t("modal.no")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (episodeToDelete != null) {
                  deleteEpisode(episodeToDelete);
                }
              }}
              variant="destructive"
            >
              {t("modal.yes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div
        className="clickable peer flex w-full justify-center py-1"
        onClick={() => setCollapsed((old) => !old)}
      >
        <ChevronUpIcon
          className={cn("transition-transform duration-300", {
            "rotate-180": !collapsed,
          })}
        ></ChevronUpIcon>
      </div>
      <div
        className={cn(
          "collapsible max-h-[calc(85vh-var(--navbar-height))] overflow-y-auto overscroll-y-none pr-2",
          {
            collapsed,
            "expanded mb-2": !collapsed,
          },
        )}
      >
        <div
          className={cn("flex flex-col items-center justify-around gap-2", {
            "overflow-hidden": collapsedAnimated,
          })}
        >
          {downloadedEpisodes.map((episode, idx) => {
            const downloadProgress = (100 * (episode.progress ?? 0)).toFixed(1) + "%";
            const episodeLink = `/liveseries/watch/${episode.showName}/${episode.season}/${episode.episode}`;
            const key = `downloads-card-${idx}`;
            const card = (
              <div className="flex w-full flex-col items-start p-2 text-sm sm:text-base">
                <div className="w-full">
                  <span>{serialise(episode)}</span>
                  <span className="font-serif"> {downloadProgress}</span>
                  {episode.speed != null && episode.status === DownloadStatus.PENDING && (
                    <span className="font-serif">
                      {" "}
                      ({bytesToReadable(episode.speed)}/s)
                    </span>
                  )}
                  {episode.status === DownloadStatus.VERIFYING && (
                    <span>
                      {" " +
                        t(
                          `liveSeries.episodes.downloadStatus.${DownloadStatus.VERIFYING}`,
                        )}
                      ...
                    </span>
                  )}
                  {episode.eta != null && episode.eta > 0 && (
                    <span className="ml-auto">
                      {" " + getDuration(episode.eta * 1000).formatted}
                    </span>
                  )}
                </div>
                <div className="bg-primary mb-1.25 h-4 w-full overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "bg-success h-full self-start transition-all [transition-duration:400ms]",
                      {
                        "bg-accent": episode.status === DownloadStatus.COMPLETE,
                      },
                    )}
                    style={{ width: downloadProgress }}
                  ></div>
                </div>
              </div>
            );
            return (
              <div
                className="bg-background sm:bg-background/50 sm:group-hover:bg-background/70 sm:hover:bg-background flex w-full rounded-sm transition-colors duration-300"
                key={key}
              >
                {episode.status === DownloadStatus.COMPLETE ? (
                  <>
                    <Link
                      href={episodeLink}
                      className="text-primary hover:text-primary-strong w-full transition-colors duration-300"
                      onClick={() => setCollapsed(true)}
                    >
                      {card}
                    </Link>
                  </>
                ) : (
                  <>{card}</>
                )}
                <div
                  className="clickable delete"
                  onClick={() => askDeleteEpisode(episode)}
                >
                  <Trash2Icon className="scale-75 sm:scale-100" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Tile>
  );
}

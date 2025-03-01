"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronUpIcon, Trash2Icon } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { DownloadedEpisode } from "@/lib/types";
import type { User } from "@/payload-types";
import { fetchFromApi } from "@/lib/backend";
import { useLiveSeriesContext } from "@/lib/context/liveseries-context";
import { useModals } from "@/lib/context/modal-context";
import { DownloadStatus } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { bytesToReadable, getDuration } from "@/lib/util";
import { cn } from "@/lib/utils";

import { showErrorToast, showFetchErrorToast } from "../error/toast";
import { Tile } from "../tile";
import { showInfoToast, showSuccessToast } from "../ui/sonner";

export function DownloadsWidget({
  user,
  userLanguage,
  accessToken,
}: {
  user: User;
  userLanguage: Language;
  accessToken: string;
}) {
  const { downloadedEpisodes } = useLiveSeriesContext();
  const [collapsed, setCollapsed] = useState(
    downloadedEpisodes.find((episode) => episode.status === DownloadStatus.PENDING) ==
      null,
  );
  const [collapsedAnimated, setCollapsedAnimated] = useState(collapsed);
  const { setModalChoice } = useModals();
  const data = TRANSLATIONS[userLanguage];
  function serialise(episode: DownloadedEpisode) {
    const episodeObject = { number: episode.episode, season: episode.season };
    return data.liveSeries.episodes.serialise(episodeObject);
  }

  async function handleDeleteEpisode(episode: DownloadedEpisode) {
    if (user == null || accessToken == null) {
      showErrorToast(data.liveSeries.home.login);
      return;
    }
    if (user.serverUrl == null || user.serverUrl === "") {
      showInfoToast(data.liveSeries.setup);
      return;
    }
    const episodeString = `${episode.showName} ${serialise(episode)}`;
    const question = data.liveSeries.episodes.confirmDelete(episodeString);
    const answer = await setModalChoice(question);
    if (!answer) return;
    try {
      await fetchFromApi(
        `liveseries/downloaded-episodes/${episode.showName}/${episode.season}/${episode.episode}`,
        { method: "DELETE", accessToken, urlBase: user.serverUrl },
      );
    } catch (error) {
      showFetchErrorToast(data, error);
      return;
    }
    showSuccessToast(data.liveSeries.episodes.deleted(episodeString));
  }

  useEffect(() => {
    setTimeout(
      () => {
        setCollapsedAnimated(collapsed);
      },
      collapsed ? 0 : 300,
    );
  }, [collapsed]);

  if (downloadedEpisodes.length === 0) return null;

  return (
    <Tile
      containerClassName={cn(
        "fixed right-0 bottom-0 z-7 w-full sm:max-w-lg rounded-t-xl rounded-b-none border-x-2 border-t-2 border-b-0 p-0 pl-2 shadow-lg transition-opacity duration-300 hover:opacity-100 sm:rounded-tr-none sm:border-r-0",
        { "sm:opacity-50": collapsed, "sm:opacity-80": !collapsed },
      )}
      className="w-full p-0"
      variant="vanilla"
    >
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
        className={cn("collapsible max-h-[80vh] overflow-y-auto pr-2", {
          collapsed,
          "expanded mb-2": !collapsed,
        })}
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
                  <span>
                    {episode.showName} {serialise(episode)}
                  </span>
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
                        data.liveSeries.episodes.downloadStatus[DownloadStatus.VERIFYING]}
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
              <div className="bg-background flex w-full rounded-sm" key={key}>
                {episode.status === DownloadStatus.COMPLETE ? (
                  <>
                    <Link
                      href={episodeLink}
                      className="w-full"
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
                  onClick={() => handleDeleteEpisode(episode)}
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

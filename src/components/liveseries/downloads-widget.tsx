"use client";

import Link from "next/link";
import { useState } from "react";
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

  if (downloadedEpisodes.length === 0) return null;

  return (
    <div
      className={cn(
        "border-background bg-background-soft fixed right-0 bottom-0 left-0 z-7 rounded-t-xl border-2 p-1 px-2 shadow-lg transition-opacity duration-300 hover:opacity-100 sm:left-[unset] sm:rounded-tr-none",
        { "sm:opacity-50": collapsed, "sm:opacity-80": !collapsed },
      )}
    >
      <div
        className="clickable peer flex justify-center"
        onClick={() => setCollapsed((old) => !old)}
      >
        <ChevronUpIcon
          className={cn("transition-transform duration-300", {
            "rotate-180": !collapsed,
          })}
        ></ChevronUpIcon>
      </div>
      <div
        className={cn("collapsible", {
          collapsed,
          "expanded pb-2": !collapsed,
        })}
      >
        <div className="flex flex-col items-center justify-around gap-2 overflow-hidden">
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
                <div className="bg-primary mb-[5px] h-4 w-full overflow-hidden rounded-full">
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
                className="bg-background box-border flex w-[500px] max-w-full overflow-hidden rounded-sm"
                key={key}
              >
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
    </div>
  );
}

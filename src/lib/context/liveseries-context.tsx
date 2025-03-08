"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { useLocale, useTranslations } from "next-intl";

import type { DownloadedEpisode, Numeric } from "@/lib/types";
import type { EpisodeArray, User, WatchedEpisodes } from "@/payload-types";
import { showErrorToast } from "@/components/error/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { showSuccessToast } from "@/components/ui/sonner";
import { getFormatters } from "@/i18n/request";
import { DownloadStatus } from "@/lib/enums";
import { compareEpisodes, ensureUnique } from "@/lib/util";

import { tryPatchUser } from "../backend/liveseries";

const LiveSeriesContext = createContext<
  | {
      downloadedEpisodes: DownloadedEpisode[];
      watchedEpisodes: WatchedEpisodes | null;
      updateUserWatchedEpisodes: (
        showId: number,
        season: Numeric,
        watchedInSeason: EpisodeArray,
      ) => Promise<void>;
      isUpdatingWatchedEpisodes: boolean;
    }
  | undefined
>(undefined);

export function useLiveSeriesContext() {
  const context = useContext(LiveSeriesContext);
  if (!context) {
    throw new Error("useLiveSeries must be used within /liveseries.");
  }
  return context;
}

const serialiseEpisodeForSorting = (episode: DownloadedEpisode) =>
  `${episode.showName}.${episode.season}.${episode.episode}`;

function getWatchedEpisodes(
  watchedEpisodes: WatchedEpisodes,
  {
    showId,
    season,
    watchedInSeason,
  }: { showId: number; season: Numeric; watchedInSeason: EpisodeArray },
) {
  const unique = ensureUnique(watchedInSeason);
  // Not updating state directly to avoid "Updated more hooks than during the previous render"
  const { [showId]: showData, ...updatedWatchedEpisodes } = watchedEpisodes;
  const { [season]: _, ...updatedShowData } = showData ?? {}; // eslint-disable-line @typescript-eslint/no-unused-vars
  if (unique.length > 0) {
    updatedShowData[season] = unique;
  }
  if (Object.keys(updatedShowData).length > 0) {
    updatedWatchedEpisodes[showId] = updatedShowData;
  }
  return updatedWatchedEpisodes;
}

export function LiveSeriesProvider({
  children,
  user,
  accessToken,
}: {
  children: ReactNode;
  user: User | null;
  accessToken: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [existingSocket, setExistingSocket] = useState<null | WebSocket>(null);
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<DownloadedEpisode[]>([]);
  const [watchedEpisodes, setWatchedEpisodes] = useState(user?.watchedEpisodes ?? {});
  const [watchedEpisodesOptimistic, setWatchedEpisodesOptimistic] = useOptimistic(
    watchedEpisodes,
    getWatchedEpisodes,
  );
  const [isDialogRetryOpen, setIsDialogRetryOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale();
  const formatters = getFormatters(locale);

  useEffect(() => {
    if (!user) return;
    connectToWebsocket();
    return () => {
      if (!existingSocket) return;
      const socket = existingSocket;
      setExistingSocket(null);
      socket.close(1000, "Client component unmounted.");
      console.info("Websocket closed.");
    };
  }, [user]);

  async function connectToWebsocket() {
    let socketFailed: boolean | undefined = undefined;
    if (existingSocket) return;
    if (!user?.serverUrl?.startsWith("http")) {
      console.warn("No decentralised server URL provided.");
      return;
    }
    if (!accessToken) return;

    let socket: WebSocket;
    const websocketUrlBase = user.serverUrl.replace("http", "ws");
    try {
      socket = new WebSocket(
        `${websocketUrlBase}liveseries/downloaded-episodes/ws?access_token=${accessToken}`,
      );
    } catch (error) {
      console.error("Websocket instantiation error:", error);
      showErrorToast(t("liveSeries.websockets.connectionFailed"));
      return;
    }
    setExistingSocket(socket);
    socket.onerror = (message) => {
      // This usually means the server is online but hasn't yet set up the websocket listener
      // If socketFailed has not yet been set to `false`, it means the server is not reachable
      console.error(
        socketFailed === undefined ? "Connection error" : "Unknown error:",
        message,
      );
      if (socketFailed !== undefined) {
        showErrorToast(t("liveSeries.websockets.error"));
      }
      socketFailed = true;
    };
    const poll = (data: DownloadedEpisode[]) =>
      socket.send(JSON.stringify({ type: "poll", data }));
    socket.onopen = () => {
      poll([]);
      socketFailed = false;
    };
    socket.onclose = async (evt) => {
      console.warn("Websocket closed on path", pathname, evt);
      if (!pathname.startsWith("/liveseries")) {
        console.info(
          "Silently dismissing websocket closure because the user navigated away.",
        );
        return;
      }
      if (evt.code === 1005 || evt.code === 1000) {
        // This might be a bad call but sometimes the websocket gets closed when changing language
        return;
      }
      if (evt.wasClean) {
        // The server URL is probably misconfigured
        showErrorToast(t("liveSeries.websockets.connectionFailed"));
        return;
      }
      if (socketFailed) return;
      setIsDialogRetryOpen(true);
    };
    socket.onmessage = (message) => {
      const torrentInfo = JSON.parse(message.data).data as DownloadedEpisode[];
      let completedDownloadName = "";
      setDownloadedEpisodes((currentDownloadedEpisodes) => {
        const mapped = torrentInfo.map((val) => {
          const found = currentDownloadedEpisodes.find((info) =>
            compareEpisodes(val, info),
          );
          if (!found) return val;
          // Check for episodes whose download status just changed
          if (
            found.status !== DownloadStatus.COMPLETE &&
            val.status === DownloadStatus.COMPLETE
          ) {
            const episodeObject = { number: val.episode, season: val.season };
            completedDownloadName = `${val.showName} ${formatters.serialiseEpisode(episodeObject)}`;
          }
          return val;
        });
        //for (const info of torrentInfo) {
        //if (currentDownloadedEpisodes.find((val) => compareEpisodes(val, info))) continue;
        //mapped.push(info);
        //}
        const sorted = mapped.sort((a, b) =>
          serialiseEpisodeForSorting(a).localeCompare(
            serialiseEpisodeForSorting(b),
            undefined,
            {
              numeric: true,
            },
          ),
        );
        poll(sorted);
        return sorted;
      });
      if (completedDownloadName)
        showSuccessToast(
          t("liveSeries.episodes.downloadComplete", { completedDownloadName }),
        );
    };
  }

  async function updateUserWatchedEpisodes(
    showId: number,
    season: Numeric,
    watchedInSeason: EpisodeArray,
  ) {
    if (user == null) {
      throw new Error("updateUserWatchedEpisodes cannot be called if user is null");
    }
    startTransition(async () => {
      const args = { showId, season, watchedInSeason };
      setWatchedEpisodesOptimistic(args);
      const updatedWatchedEpisodes = getWatchedEpisodes(watchedEpisodes, args);
      const success = await tryPatchUser(user, t("networkError"), {
        watchedEpisodes: updatedWatchedEpisodes,
      });
      if (success) {
        setWatchedEpisodes(updatedWatchedEpisodes);
      }
    });
  }

  return (
    <LiveSeriesContext.Provider
      value={{
        downloadedEpisodes,
        watchedEpisodes: watchedEpisodesOptimistic,
        updateUserWatchedEpisodes,
        isUpdatingWatchedEpisodes: isPending,
      }}
    >
      <AlertDialog open={isDialogRetryOpen} onOpenChange={setIsDialogRetryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("liveSeries.websockets.askReconnect")}</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              {t("liveSeries.websockets.askReconnect")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("modal.no")}</AlertDialogCancel>
            <AlertDialogAction onClick={connectToWebsocket}>
              {t("modal.yes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {children}
    </LiveSeriesContext.Provider>
  );
}

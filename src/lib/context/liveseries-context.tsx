"use client";

import type { ReactNode } from "react";
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
import { usePathname } from "@/i18n/navigation";
import { getFormatters } from "@/i18n/request";
import { DownloadStatus } from "@/lib/enums";
import { compareEpisodes, ensureUnique } from "@/lib/util";

import { tryPatchUser } from "../backend/liveseries";

const WEBSOCKET_POLL_INTERVAL_MS = 1000;
type WebsocketMessage =
  | { type: "polled"; data: DownloadedEpisode[] }
  | { type: "authenticated"; success: boolean }
  | { type: "error"; error: string };

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
  const [pollTimeout, setPollTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;
    connectToWebsocket();
    return () => {
      if (pollTimeout != null) {
        clearTimeout(pollTimeout);
      }
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
      socket = new WebSocket(`${websocketUrlBase}liveseries/downloaded-episodes/ws`);
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
      socket.send(JSON.stringify({ type: "authenticate", token: accessToken }));
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
    socket.onmessage = (rawMessage) => {
      const message: WebsocketMessage = JSON.parse(rawMessage.data);
      switch (message.type) {
        case "polled":
          handleEpisodesUpdate(message.data, poll);
          break;
        case "authenticated":
          if (message.success) {
            poll([]);
          } else {
            showErrorToast(t("liveSeries.websockets.connectionFailed"));
            socket.close();
          }
          break;
        case "error":
          console.error("Received error frame:", message.error);
          break;
      }
    };
  }

  function onDownloadComplete(episode: DownloadedEpisode) {
    const episodeObject = { number: episode.episode, season: episode.season };
    showSuccessToast(
      t("liveSeries.episodes.downloadComplete", {
        episode: `${episode.showName} ${formatters.serialiseEpisode(episodeObject)}`,
      }),
      { duration: 10000 },
    );
  }

  function handleEpisodesUpdate(
    torrentInfo: DownloadedEpisode[],
    poll: (episodes: DownloadedEpisode[]) => void,
  ) {
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
          onDownloadComplete(val);
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
      setPollTimeout(
        setTimeout(() => {
          poll(sorted);
        }, WEBSOCKET_POLL_INTERVAL_MS),
      );
      return sorted;
    });
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

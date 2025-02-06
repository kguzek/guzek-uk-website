"use client";

import { usePathname } from "next/navigation";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { DownloadStatus } from "@/lib/enums";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import type { DownloadedEpisode, User } from "@/lib/types";
import { compareEpisodes } from "@/lib/util";

import { useModals } from "./modal-context";

const LiveSeriesContext = createContext<
  | {
      downloadedEpisodes: DownloadedEpisode[];
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

export function LiveSeriesProvider({
  children,
  user,
  userLanguage,
  accessToken,
}: {
  children: ReactNode;
  user: User | null;
  userLanguage: Language;
  accessToken: string | null;
}) {
  const [existingSocket, setExistingSocket] = useState<null | WebSocket>(null);
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<
    DownloadedEpisode[]
  >([]);
  const { setModalInfo, setModalError, setModalChoice } = useModals();
  const pathname = usePathname();
  const data = TRANSLATIONS[userLanguage];

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
      setModalError(data.liveSeries.websockets.connectionFailed);
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
      if (socketFailed !== undefined)
        setModalError(data.liveSeries.websockets.error);
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
        setModalError(data.liveSeries.websockets.connectionFailed);
        return;
      }
      if (socketFailed) return;
      const reconnect = await setModalChoice(
        data.liveSeries.websockets.askReconnect,
      );
      if (reconnect) await connectToWebsocket();
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
          )
            completedDownloadName = `${
              val.showName
            } ${data.liveSeries.episodes.serialise(val)}`;
          return val;
        });
        //for (const info of torrentInfo) {
        //if (currentDownloadedEpisodes.find((val) => compareEpisodes(val, info))) continue;
        //mapped.push(info);
        //}
        const sorted = mapped.sort((a, b) =>
          serialiseEpisodeForSorting(a).localeCompare(
            serialiseEpisodeForSorting(b),
            "en",
            { numeric: true },
          ),
        );
        poll(sorted);
        return sorted;
      });
      if (completedDownloadName)
        setModalInfo(
          data.liveSeries.episodes.downloadComplete(completedDownloadName),
        );
    };
  }

  return (
    <LiveSeriesContext.Provider
      value={{
        downloadedEpisodes,
      }}
    >
      {children}
    </LiveSeriesContext.Provider>
  );
}

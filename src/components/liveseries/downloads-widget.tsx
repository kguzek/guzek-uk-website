"use client";

import { useState } from "react";
import Link from "next/link";
import type { DownloadedEpisode, User } from "@/lib/types";
import { DownloadStatus } from "@/lib/enums";
import type { Language } from "@/lib/enums";
import { bytesToReadable, getDuration } from "@/lib/util";
import { TRANSLATIONS } from "@/lib/translations";
import { clientToApi } from "@/lib/backend/client";
import { useModals } from "@/context/modal-context";
import "./downloads-widget.css";

export default function DownloadsWidget({
  user,
  userLanguage,
  accessToken,
  downloadedEpisodes,
}: {
  user: User;
  userLanguage: Language;
  accessToken: string;
  downloadedEpisodes: DownloadedEpisode[];
}) {
  const [collapsed, setCollapsed] = useState(
    downloadedEpisodes.find(
      (episode) => episode.status === DownloadStatus.PENDING,
    ) == null,
  );
  const { setModalError, setModalChoice, setModalInfo } = useModals();
  const data = TRANSLATIONS[userLanguage];
  const serialise = data.liveSeries.episodes.serialise;

  async function handleDeleteEpisode(episode: DownloadedEpisode) {
    const episodeString = `${episode.showName} ${serialise(episode)}`;
    const question = data.liveSeries.episodes.confirmDelete(episodeString);
    const answer = await setModalChoice(question);
    if (!answer) return;
    const result = await clientToApi(
      `liveseries/downloaded-episodes/${episode.showName}/${episode.season}/${episode.episode}`,
      accessToken,
      { method: "DELETE", user, userLanguage, setModalError },
    );
    if (result.ok) {
      setModalInfo(data.liveSeries.episodes.deleted(episodeString));
    }
  }

  if (downloadedEpisodes.length === 0) return null;

  return (
    <div
      className={`downloads-widget flex-column ${
        collapsed ? "collapsed" : "expanded"
      }`}
    >
      <div
        className="clickable collapser centred"
        onClick={() => setCollapsed((old) => !old)}
      >
        <i
          className={`fas fa-chevron-up transition-transform ${
            collapsed ? "" : "rotate-180"
          }`}
        ></i>
      </div>
      <div className="collapsible-container">
        <div className={`collapsible ${collapsed ? "hidden" : ""}`}>
          <div className="flex-column no-overflow flex">
            {downloadedEpisodes.map((episode, idx) => {
              const downloadProgress =
                (100 * (episode.progress ?? 0)).toFixed(1) + "%";
              const episodeLink = `/liveseries/watch/${episode.showName}/${episode.season}/${episode.episode}`;
              const key = `downloads-card-${idx}`;
              const card = (
                <div className="downloads-card flex">
                  <div style={{ width: "100%" }}>
                    <span>
                      {episode.showName} {serialise(episode)}
                    </span>
                    <span className="serif"> {downloadProgress}</span>
                    {episode.speed != null &&
                      episode.status === DownloadStatus.PENDING && (
                        <span className="serif">
                          {" "}
                          ({bytesToReadable(episode.speed)}/s)
                        </span>
                      )}
                    {episode.status === DownloadStatus.VERIFYING && (
                      <span>
                        {" " +
                          data.liveSeries.episodes.downloadStatus[
                            DownloadStatus.VERIFYING
                          ]}
                        ...
                      </span>
                    )}
                    {episode.eta != null && episode.eta > 0 && (
                      <span className="eta">
                        {" " + getDuration(episode.eta * 1000).formatted}
                      </span>
                    )}
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar ${
                        episode.status === DownloadStatus.COMPLETE ? "done" : ""
                      }`}
                      style={{ width: downloadProgress }}
                    ></div>
                  </div>
                </div>
              );
              return (
                <div
                  className="downloads-card-container no-overflow flex"
                  key={key}
                >
                  {episode.status === DownloadStatus.COMPLETE ? (
                    <>
                      <Link
                        href={episodeLink}
                        className="downloads-card-container no-overflow flex"
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
                    <i className="fas fa-trash"></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

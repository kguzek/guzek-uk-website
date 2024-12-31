"use client";

import { useState } from "react";
import Link from "next/link";
import { DownloadedEpisode, DownloadStatus } from "@/lib/types";
import { bytesToReadable, getDuration } from "@/lib/util";
import { useModals } from "@/context/modal-context";
import { useTranslations } from "@/context/translation-context";
import { useLiveSeries } from "@/context/liveseries-context";
import "./downloads-widget.css";

export default function DownloadsWidget() {
  const { downloadedEpisodes, fetchResource } = useLiveSeries();
  const [collapsed, setCollapsed] = useState(
    downloadedEpisodes.find(
      (episode) => episode.status === DownloadStatus.PENDING
    ) == null
  );
  const { data } = useTranslations();
  const { setModalInfo, setModalChoice } = useModals();
  const serialise = data.liveSeries.episodes.serialise;

  async function handleDeleteEpisode(episode: DownloadedEpisode) {
    const episodeString = `${episode.showName} ${serialise(episode)}`;
    const question = data.liveSeries.episodes.confirmDelete(episodeString);
    const answer = await setModalChoice(question);
    if (!answer) return;
    function onSuccess() {
      setModalInfo(data.liveSeries.episodes.deleted(episodeString));
    }
    fetchResource(
      `downloaded-episodes/${episode.showName}/${episode.season}/${episode.episode}`,
      { method: "DELETE", onSuccess, useEpisodate: false }
    );
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
          className={`fas transition-transform fa-chevron-up ${
            collapsed ? "" : "rotate-180"
          }`}
        ></i>
      </div>
      <div className="collapsible-container">
        <div className={`collapsible ${collapsed ? "hidden" : ""}`}>
          <div className="flex flex-column no-overflow">
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
                  className="downloads-card-container flex no-overflow"
                  key={key}
                >
                  {episode.status === DownloadStatus.COMPLETE ? (
                    <>
                      <Link
                        href={episodeLink}
                        className="downloads-card-container flex no-overflow"
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

import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LiveSeriesOutletContext } from "../../pages/LiveSeries/Base";
import { TranslationContext, ModalContext } from "../../misc/context";
import { DownloadedEpisode, DownloadStatus } from "../../misc/models";
import { bytesToReadable, getDuration } from "../../misc/util";
import "./DownloadsWidget.css";

export default function DownloadsWidget({
  downloadedEpisodes,
  fetchResource,
}: {
  downloadedEpisodes: DownloadedEpisode[];
  fetchResource: LiveSeriesOutletContext["fetchResource"];
}) {
  const [collapsed, setCollapsed] = useState(
    downloadedEpisodes.find(
      (episode) => episode.status === DownloadStatus.PENDING
    ) == null
  );
  const data = useContext(TranslationContext);
  const { setModalInfo, setModalChoice } = useContext(ModalContext);
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
      `video/${episode.showName}/${episode.season}/${episode.episode}`,
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
                  <div className="flex" style={{ width: "100%" }}>
                    <div>
                      {episode.showName} {serialise(episode)}
                    </div>
                    <div className="serif">{downloadProgress}</div>
                    {episode.speed != null &&
                      episode.status === DownloadStatus.PENDING && (
                        <div className="serif">
                          ({bytesToReadable(episode.speed)}/s)
                        </div>
                      )}
                    {episode.status === DownloadStatus.VERIFYING && (
                      <div>
                        {
                          data.liveSeries.episodes.downloadStatus[
                            DownloadStatus.VERIFYING
                          ]
                        }
                        ...
                      </div>
                    )}
                    {episode.eta != null && episode.eta > 0 && (
                      <div className="eta">
                        {getDuration(episode.eta * 1000).formatted}
                      </div>
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
                        className="downloads-card-container flex no-overflow"
                        to={episodeLink}
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

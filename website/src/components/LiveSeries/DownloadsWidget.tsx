import { useState, useContext } from "react";
import { TranslationContext } from "../../misc/context";
import { DownloadedEpisode, DownloadStatus } from "../../misc/models";
import { bytesToReadable, getDuration } from "../../misc/util";
import "./DownloadsWidget.css";

export default function DownloadsWidget({
  downloadedEpisodes,
}: {
  downloadedEpisodes: DownloadedEpisode[];
}) {
  const [collapsed, setCollapsed] = useState(downloadedEpisodes.find(
      (episode) => episode.status === DownloadStatus.PENDING
    ) == null);
  const data = useContext(TranslationContext);
  const serialise = data.liveSeries.tvShow.serialiseEpisode

  if (downloadedEpisodes.length === 0) return null;

  return <div className={`downloads-widget flex-column ${collapsed ? 'collapsed' : 'expanded'}`}>
    <div className="clickable collapser centred" onClick={() => setCollapsed((old) => !old)}>
      <i className={`fas fa-chevron-down ${collapsed ? 'rotated' : ''}`}></i>
    </div>
    <div className="collapsible-container">
      <div className={`collapsible ${collapsed ? 'hidden' : ''}`}>
        <div className="flex flex-column no-overflow">
          {downloadedEpisodes.map((episode, idx) => {
            const downloadProgress = (100 * (episode.progress ?? 0)).toFixed(1) + "%";
            return <div key={`downloads-card-${idx}`} className="downloads-card flex">
              <div className="flex" style={{ width: "100%" }}>
                <div>{episode.showName} {serialise(episode)}</div>
                <div className="serif">{downloadProgress}</div>
                {episode.speed != null && episode.status === DownloadStatus.PENDING &&
                  <div className="serif">({bytesToReadable(episode.speed)}/s)</div>
                }
                {episode.eta != null && episode.eta > 0 &&
                  <div className="eta">{getDuration(episode.eta * 1000).formatted}</div>
                }
              </div>
              <div className="progress-bar-container">
                <div
                  className={`progress-bar ${episode.status === DownloadStatus.COMPLETE ? 'done' : ''}`}
                  style={{width: downloadProgress}}
                ></div>
              </div>
            </div>
          })}
        </div>
      </div>
    </div>
  </div>;
}

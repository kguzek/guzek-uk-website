import { useState, useContext } from "react";
import { TranslationContext } from "../../misc/context";
import { DownloadedEpisode } from "../../misc/models";
import { bytesToReadable } from "../../misc/util";
import "./DownloadsWidget.css";

export default function DownloadsWidget({
  downloadedEpisodes,
}: {
  downloadedEpisodes: DownloadedEpisode[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const data = useContext(TranslationContext);
  const serialise = data.liveSeries.tvShow.serialiseEpisode

  return <div className={`downloads-widget flex-column ${collapsed ? 'collapsed' : ''}`}>
    <div className="clickable collapser centred" onClick={() => setCollapsed((old) => !old)}>
      <i className={`fas fa-chevron-down ${collapsed ? 'rotated' : ''}`}></i>
    </div>
    <div className={`collapsible ${collapsed ? 'hidden' : ''}`}>
      <div className="flex flex-column no-overflow">
        {downloadedEpisodes.map((episode, idx) => {
          const downloadProgress = (100 * (episode.status === 3 ? 1 : episode.progress ?? 0)).toFixed(1) + "%";
          return <div key={`downloads-card-${idx}`} className="downloads-card flex">
            <div className="flex">
              <div>{episode.showId} {serialise(episode)}</div>
              <div className="serif">{downloadProgress}</div>
              {episode.speed != null &&
                <div className="serif">({bytesToReadable(episode.speed)}/s)</div>
              }
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{width: downloadProgress}}></div>
            </div>
          </div>
        })}
      </div>
    </div>
  </div>;
}

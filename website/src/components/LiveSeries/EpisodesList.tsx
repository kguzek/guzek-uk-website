import React, { ReactElement, useContext, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { TranslationContext, useFetchContext, ModalContext, AuthContext } from "../../misc/context";
import {
  Episode as EpisodeType,
  TvShowDetails,
  DownloadedEpisode,
} from "../../misc/models";
import { getEpisodeAirDate, hasEpisodeAired } from "../../misc/util";
import { LiveSeriesOutletContext } from "../../pages/LiveSeries/Base";

function Episode({
  episode,
  tvShow,
}: {
  episode: EpisodeType;
  tvShow: TvShowDetails;
}) {
  const [metadata, setMetadata] = useState<DownloadedEpisode | undefined>();
  const data = useContext(TranslationContext);
  const { user } = useContext(AuthContext);
  const { setModalError } = useContext(ModalContext);
  const {
    setWatchedEpisodes,
    watchedEpisodes,
    fetchResource,
    downloadedEpisodes,
    monitorEpisodeDownloads,
  } = useOutletContext<LiveSeriesOutletContext>();
  const { removeOldCaches } = useFetchContext();

  const airDate = data.dateTimeFormat.format(getEpisodeAirDate(episode));
  const watchedInSeason = watchedEpisodes?.[tvShow.id]?.[+episode.season];
  const isWatched = watchedInSeason?.includes(episode.episode); 
  const episodeString = `${tvShow.name} ${data.liveSeries.tvShow.serialiseEpisode(episode)}`;

  const episodePredicate = (check: DownloadedEpisode) => 
    check.showId === tvShow.id &&
    check.season === episode.season &&
    check.episode === episode.episode;

  useEffect(() => {
    const downloadedEpisode = downloadedEpisodes.find(episodePredicate);
    setMetadata(downloadedEpisode);
  }, [downloadedEpisodes]);

  function updateWatchedEpisodes(episodes: number[]) {
    fetchResource(`watched-episodes/personal/${tvShow.id}/${episode.season}`, {
      method: "PUT",
      onSuccess: () => removeOldCaches(),
      onError: () => setWatchedEpisodes(watchedEpisodes),
      body: episodes,
      useEpisodate: false,
    });
    setWatchedEpisodes((old) => ({
      ...old,
      [tvShow.id]: { ...old?.[tvShow.id], [episode.season]: episodes },
    }));
  }

  function startDownload() {
    fetchResource("downloaded-episodes", {
      method: "POST",
      useEpisodate: false,
      body: { tvShow, episode },
      onSuccess: (data) => monitorEpisodeDownloads(data, episodePredicate, episodeString),
      onError: () => {
        setModalError(data.liveSeries.downloadError.replace("{episode}", episodeString));
        setMetadata((old) => old && ({...old, status: 4}));
      },
    });
    setMetadata((old) => old && ({...old, status: 2}));
  }

  let downloadTooltip = data.liveSeries.downloadStatus[metadata?.status ?? 1];
  if (metadata?.status === 2 && metadata?.progress != null)
    downloadTooltip += ` (${Math.floor(metadata.progress * 100)}%)`

  return (
    <div className="episode">
      <div className="episode-details no-overflow">
        <div className="flex" title={episode.name}>
          <span className="color-primary">
            {data.liveSeries.tvShow.serialiseEpisode(episode)}
          </span>{" "}
          <div className="cutoff">{episode.name}</div>
        </div>
        <small>{airDate}</small>
      </div>
      <div className="flex gap-10 noshrink">
        {user?.admin &&
          <div
            className="flex"
            title={downloadTooltip}
            onClick={(metadata?.status ?? 1) === 1 ? startDownload : undefined}
          >
            {metadata?.status === 2 && 
              <i
                className="fas fa-download status-progress-bar"
                style={{ backgroundSize: `${100 * (metadata?.progress ?? 0)}%` }}
              ></i>
            }
            <i className={`fas fa-download status-${metadata?.status ?? 1}`}></i>
          </div>
        }
        {hasEpisodeAired(episode) ? (
          <div
            className="watched centred"
            title={data.liveSeries.tvShow.markWatched.replace(
              "{UN}",
              isWatched ? data.liveSeries.tvShow.un : ""
            )}
            onClick={() =>
              updateWatchedEpisodes(
                isWatched
                  ? watchedInSeason?.filter(
                      (value) => value !== episode.episode
                    ) ?? []
                  : [...(watchedInSeason ?? []), episode.episode]
              )
            }
          >
            <i
              className={`clickable fas fa-eye${isWatched ? "" : "-slash"}`}
            ></i>
          </div>
        ) : (
          <i className="watched centred fa-regular fa-clock"></i>
        )}
      </div>
    </div>
  );
}

export default function EpisodesList({
  tvShow,
  heading,
  episodes,
  children,
}: {
  tvShow: TvShowDetails;
  heading: string;
  episodes: EpisodeType[];
  children?: ReactElement<any, any>;
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      <div className="episodes-header gap-15">
        <div
          className="clickable flex gap-15"
          onClick={() => setCollapsed((old) => !old)}
        >
          <i className={`fas fa-caret-${collapsed ? "down" : "up"}`}></i>
          <h4>{heading}</h4>
        </div>
        {children}
      </div>
      <div
        className={`episodes-container collapsible ${
          collapsed ? "hidden" : ""
        }`}
      >
        <div className="episodes flex-wrap gap-10 no-overflow">
          {episodes.map((episode, idx) => (
            <Episode
              key={`episode-unwatched-${idx}`}
              episode={episode}
              tvShow={tvShow}
            />
          ))}
        </div>
      </div>
    </>
  );
}


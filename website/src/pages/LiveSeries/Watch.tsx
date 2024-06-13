import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import ErrorPage from "../ErrorPage";
import { ErrorCode } from "../../misc/models";
import { TranslationContext, ModalContext } from "../../misc/context";
import { API_BASE } from "../../misc/backend";

function isNumber(val: string | undefined): val is string {
  return val != null && `${+val}` === val;
}

export default function Watch() {
  const { showName, season, episode } = useParams();
  const data = useContext(TranslationContext);
  const { setModalError } = useContext(ModalContext);
  const [loadingFailed, setLoadingFailed] = useState(false);

  if (!showName || !isNumber(season) || !isNumber(episode)) {
    return <ErrorPage errorCode={ErrorCode.NotFound} />;
  }  
  
  const showNameEncoded = encodeURIComponent(showName);
  const source = `${API_BASE}liveseries/video/${showNameEncoded}/${season}/${episode}`;
  const episodeObject = { episode: +episode, season: +season };

  function onError(evt: React.SyntheticEvent<HTMLVideoElement, Event>) {
    console.error(evt.nativeEvent);
    setModalError(data.liveSeries.watch.playbackError);
    setLoadingFailed(true);
  }

  return (
    <div>
      <h2>{showName} {data.liveSeries.tvShow.serialiseEpisode(episodeObject)}</h2>
      {loadingFailed && <p className="centred">{data.liveSeries.watch.playbackError}</p>}
      <video className={loadingFailed ? "hidden" : ""} controls src={source} autoPlay onError={onError}></video>
    </div>
  );
}


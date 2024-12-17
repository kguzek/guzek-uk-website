import React, { useEffect, useRef, useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorPage from "../ErrorPage";
import { Language, ErrorCode } from "../../misc/models";
import { TranslationContext, ModalContext } from "../../misc/context";
import { API_BASE, API_BASE_VIDEO } from "../../misc/backend";

function isNumber(val: string | undefined): val is string {
  return val != null && `${+val}` === val && +val > 0;
}

const VIDEO_FRAME_RATE = 25; // frames per second
const VIDEO_FRAME_LENGTH = 1 / VIDEO_FRAME_RATE; // seconds per frame

export default function Watch({ lang }: { lang: Language }) {
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { showName, season, episode } = useParams();
  const data = useContext(TranslationContext);
  const { setModalError } = useContext(ModalContext);
  const [loadingFailed, setLoadingFailed] = useState<boolean | undefined>(
    false
  );
  const [currentIcon, setCurrentIcon] = useState("");
  const [iconVisibility, setIconVisibility] = useState("hidden");
  const [currentTimeout, setCurrentTimeout] = useState<null | number>(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      window.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  if (!showName || !isNumber(season) || !isNumber(episode)) {
    return <ErrorPage errorCode={ErrorCode.NotFound} />;
  }

  const showNameEncoded = encodeURIComponent(showName);
  const path = `${showNameEncoded}/${season}/${episode}`;
  const episodeObject = { episode: +episode, season: +season };

  function onLoadStart() {
    setLoadingFailed(undefined);
  }

  function onError(evt: React.SyntheticEvent<HTMLVideoElement, Event>) {
    // Only update if it's `undefined`, not `false`
    if (loadingFailed === false) return;
    console.error(evt.nativeEvent);
    setModalError(data.liveSeries.watch.playbackError);
    setLoadingFailed(true);
  }

  function onLoad() {
    setLoadingFailed(false);
  }

  function setIcon(icon: string, faClass: string = "fa-solid") {
    setCurrentIcon(`${faClass} fa-${icon}`);
    if (!icon) return;
    if (currentTimeout != null) clearTimeout(currentTimeout);
    setIconVisibility("visible");
    setCurrentTimeout(
      window.setTimeout(() => {
        setIconVisibility("hidden");
        setCurrentTimeout(
          window.setTimeout(() => {
            setCurrentIcon("");
            setCurrentTimeout(null);
          }, 500)
        );
      }, 500)
    );
  }

  function onKeyPress(evt: React.KeyboardEvent<HTMLDivElement>) {
    if (!videoRef || !videoContainerRef) return;
    const video = videoRef.current;
    const videoContainer = videoContainerRef.current;
    if (!video || !videoContainer) return;
    switch (evt.key) {
      case "f": // Toggle fullscreen
        document.fullscreenElement == null
          ? videoContainer.requestFullscreen()
          : document.exitFullscreen();
        break;
      case "j": // Skip behind 10 s
        video.currentTime = Math.max(0, video.currentTime - 10);
        setIcon("chevron-left");
        break;
      case "k": // Toggle pause
        if (video.paused || video.ended) {
          video.play();
          setIcon("play");
        } else {
          video.pause();
          setIcon("pause");
        }
        break;
      case "l": // Skip forward 10 s
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        setIcon("chevron-right");
        break;
      case evt.key.match(/[0-9]/)?.input: // Skip to n/10 ths of the video's duration
        video.currentTime = video.duration * (+evt.key / 10);
        break;
      case ",": // Skip behind 1 frame
        video.currentTime = Math.max(0, video.currentTime - VIDEO_FRAME_LENGTH);
        break;
      case ".": // Skip forward 1 frame
        video.currentTime = Math.min(
          video.duration,
          video.currentTime + VIDEO_FRAME_LENGTH
        );
        break;
      case "c": // Toggle subtitles
        const subtitleTrack = video.textTracks[0];
        if (!subtitleTrack) break;
        if (subtitleTrack.mode === "showing") {
          setIcon("closed-captioning", "fa-regular");
          subtitleTrack.mode = "hidden";
        } else {
          setIcon("closed-captioning");
          subtitleTrack.mode = "showing";
        }
        break;
      default:
        return;
    }
  }

  function onFullscreenChange(evt: Event) {
    if (!videoRef || !videoContainerRef) return;
    const video = videoRef.current;
    const videoContainer = videoContainerRef.current;
    if (!video || !videoContainer || evt.target !== video) return;
    // Synchronise player fullscreen button and actual state
    // This feature probably won't be implemented, but I'm leaving the boilerplate here
    // ...
  }

  function onEnded() {
    if (episode == null) {
      throw new Error("Episode number is nullish");
    }
    navigate(`/liveseries/watch/${showNameEncoded}/${season}/${+episode + 1}`);
  }

  return (
    <div onKeyPress={onKeyPress}>
      <h2>
        {showName} {data.liveSeries.episodes.serialise(episodeObject)}
      </h2>
      <div className="flex gap-15" style={{ marginBottom: "10px" }}>
        {+season > 1 && (
          <>
            <Link to={`/liveseries/watch/${showNameEncoded}/${+season - 1}/1`}>
              {data.liveSeries.watch.previous} {data.liveSeries.tvShow.season}
            </Link>
            |
          </>
        )}
        <Link to={`/liveseries/watch/${showNameEncoded}/${+season + 1}/1`}>
          {data.liveSeries.watch.next} {data.liveSeries.tvShow.season}
        </Link>
        |
        {+episode > 1 && (
          <>
            <Link
              to={`/liveseries/watch/${showNameEncoded}/${season}/${
                +episode - 1
              }`}
            >
              {data.liveSeries.watch.previous} {data.liveSeries.tvShow.episode}
            </Link>
            |
          </>
        )}
        <Link
          to={`/liveseries/watch/${showNameEncoded}/${season}/${+episode + 1}`}
        >
          {data.liveSeries.watch.next} {data.liveSeries.tvShow.episode}
        </Link>
      </div>
      {loadingFailed && (
        <p className="centred">{data.liveSeries.watch.playbackError}</p>
      )}
      <div ref={videoContainerRef} className="video-container">
        <div className={`video-icon ${iconVisibility} flex-column`}>
          <i className={currentIcon}></i>
        </div>
        <video
          ref={videoRef}
          className={loadingFailed ? "" : ""}
          controls
          src={`${API_BASE_VIDEO}liveseries/video/${path}`}
          autoPlay
          onError={onError}
          onLoadStart={onLoadStart}
          onLoadedData={onLoad}
          crossOrigin="anonymous"
          onEnded={onEnded}
        >
          <track
            label="English"
            kind="subtitles"
            srcLang="en"
            src={`${API_BASE}liveseries/subtitles/${path}?lang=${lang}`}
            default
          />
        </video>
      </div>
    </div>
  );
}

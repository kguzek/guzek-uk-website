"use client";

import type { KeyboardEvent, SyntheticEvent } from "react";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { showErrorToast } from "@/components/error/toast";
import { useRouter } from "@/lib/hooks/router";

const VIDEO_FRAME_RATE = 25; // frames per second
const VIDEO_FRAME_LENGTH = 1 / VIDEO_FRAME_RATE; // seconds per frame

export function Player({
  showName,
  season,
  episode,
  apiBase,
  accessToken,
}: {
  showName: string;
  season: number;
  episode: number;
  apiBase: string;
  accessToken: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loadingFailed, setLoadingFailed] = useState<boolean | undefined>(false);
  const router = useRouter();
  const t = useTranslations();

  function onLoadStart() {
    setLoadingFailed(undefined);
  }

  function onError(evt: SyntheticEvent<HTMLVideoElement, Event>) {
    // Only update if it's `undefined`, not `false`
    if (loadingFailed === false) return;
    console.error(evt.nativeEvent);
    showErrorToast(t("liveSeries.watch.playbackError"));
    setLoadingFailed(true);
  }

  function onLoad() {
    setLoadingFailed(false);
  }

  function onKeyPress(evt: KeyboardEvent<HTMLDivElement>) {
    if (!videoRef) return;
    const video = videoRef.current;
    if (!video) return;
    switch (evt.key) {
      case "j": // Skip behind 10 s
        video.currentTime = Math.max(0, video.currentTime - 10);
        break;
      case "k": // Toggle pause
        if (video.paused || video.ended) {
          video.play();
        } else {
          video.pause();
        }
        break;
      case "l": // Skip forward 10 s
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
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
          video.currentTime + VIDEO_FRAME_LENGTH,
        );
        break;
      case "c": // Toggle subtitles
        if (!video.textTracks[0]) break;
        if (video.textTracks[0].mode === "showing") {
          video.textTracks[0].mode = "hidden";
        } else {
          video.textTracks[0].mode = "showing";
        }
        break;
      default:
        return;
    }
  }

  function onEnded() {
    router.push(`/liveseries/watch/${showName}/${season}/${episode + 1}`);
  }

  const path = `${showName}/${season}/${episode}?access_token=${accessToken}`;

  return (
    <div onKeyDown={onKeyPress}>
      {loadingFailed && <p className="centred">{t("liveSeries.watch.playbackError")}</p>}
      <video
        ref={videoRef}
        controls
        src={`${apiBase}liveseries/video/${path}`}
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
          src={`${apiBase}liveseries/subtitles/${path}`}
          default
        />
      </video>
    </div>
  );
}

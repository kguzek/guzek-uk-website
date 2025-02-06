"use client";

import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

import type { Language } from "@/lib/enums";
import { useModals } from "@/context/modal-context";
import { TRANSLATIONS } from "@/lib/translations";

const VIDEO_FRAME_RATE = 25; // frames per second
const VIDEO_FRAME_LENGTH = 1 / VIDEO_FRAME_RATE; // seconds per frame

export function Player({
  showName,
  season,
  episode,
  apiBase,
  accessToken,
  userLanguage,
}: {
  showName: string;
  season: number;
  episode: number;
  apiBase: string;
  accessToken: string;
  userLanguage: Language;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loadingFailed, setLoadingFailed] = useState<boolean | undefined>(
    false,
  );
  const router = useRouter();
  const { setModalError } = useModals();
  const data = TRANSLATIONS[userLanguage];

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

  function onKeyPress(evt: React.KeyboardEvent<HTMLDivElement>) {
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
      {loadingFailed && (
        <p className="centred">{data.liveSeries.watch.playbackError}</p>
      )}
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

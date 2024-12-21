import React, { useEffect, useRef, useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ErrorPage from "../ErrorPage";
import { Language, ErrorCode } from "../../misc/models";
import {
  TranslationContext,
  ModalContext,
  AuthContext,
} from "../../misc/context";
import { getAccessToken, getDecentralisedApiUrl } from "../../misc/backend";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { ReactNetflixPlayer } from "react-netflix-player";

function isNumber(val: string | undefined): val is string {
  return val != null && `${+val}` === val && +val > 0;
}

// Need to declare this locally as `react-netflix-player` hasn't exported the enum
enum LanguagesPlayer {
  en = "en",
  pt = "pt",
}

export default function Watch({ lang }: { lang: Language }) {
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const { showName, season, episode } = useParams();
  const data = useContext(TranslationContext);
  const { setModalError } = useContext(ModalContext);
  const [accessToken, setAccessToken] = useState<string | null | undefined>();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (!authContext.user) return;
    updateAccessToken();
  }, [authContext.user]);

  async function updateAccessToken() {
    const token = await getAccessToken(authContext);
    setAccessToken(token);
  }

  if (!showName || !isNumber(season) || !isNumber(episode)) {
    return <ErrorPage errorCode={ErrorCode.NotFound} />;
  }

  const showNameEncoded = encodeURIComponent(showName);
  const episodeObject = { episode: +episode, season: +season };

  function onError() {
    // Only update if it's `undefined`, not `false`
    setModalError(data.liveSeries.watch.playbackError);
  }

  function onEnded() {
    if (episode == null) {
      throw new Error("Episode number is nullish");
    }
    navigate(`/liveseries/watch/${showNameEncoded}/${season}/${+episode + 1}`);
  }

  if (accessToken === undefined) {
    return <LoadingScreen />;
  }

  if (!accessToken || !authContext.user) {
    return <ErrorPage errorCode={ErrorCode.Unauthorized} />;
  }

  const sourcePath = `${showNameEncoded}/${season}/${episode}?access_token=${accessToken}`;

  const urlBase = getDecentralisedApiUrl(authContext);

  return (
    <div>
      <h2>
        {showName} {data.liveSeries.episodes.serialise(episodeObject)}
      </h2>
      <div
        className="flex gap-15 episode-controls"
        style={{ marginBottom: "10px" }}
      >
        <div className="flex gap-10">
          {+season > 1 && (
            <>
              <Link
                to={`/liveseries/watch/${showNameEncoded}/${+season - 1}/1`}
              >
                {data.liveSeries.watch.previous} {data.liveSeries.tvShow.season}
              </Link>
              |
            </>
          )}
          <Link to={`/liveseries/watch/${showNameEncoded}/${+season + 1}/1`}>
            {data.liveSeries.watch.next} {data.liveSeries.tvShow.season}
          </Link>
        </div>
        <span className="separator">|</span>
        <div className="flex gap-10">
          {+episode > 1 && (
            <>
              <Link
                to={`/liveseries/watch/${showNameEncoded}/${season}/${
                  +episode - 1
                }`}
              >
                {data.liveSeries.watch.previous}{" "}
                {data.liveSeries.tvShow.episode}
              </Link>
              |
            </>
          )}
          <Link
            to={`/liveseries/watch/${showNameEncoded}/${season}/${
              +episode + 1
            }`}
          >
            {data.liveSeries.watch.next} {data.liveSeries.tvShow.episode}
          </Link>
        </div>
      </div>
      <div ref={videoContainerRef} className="video-container">
        <ReactNetflixPlayer
          playerLanguage={LanguagesPlayer.en}
          src={`${urlBase}liveseries/video/${sourcePath}`}
          fullPlayer={false}
          autoPlay={true}
          onErrorVideo={() => onError()}
          backButton={() =>
            navigate(
              `/liveseries/tv-show/${showName.toLowerCase().replace(/ /g, "-")}`
            )
          }
          dataNext={{
            title: `${data.liveSeries.watch.next} ${data.liveSeries.tvShow.episode}`,
            description: `${showName} ${data.liveSeries.episodes.serialise({
              ...episodeObject,
              episode: episodeObject.episode + 1,
            })}`,
          }}
          onNextClick={onEnded}
          // TODO: DO NOT UNCOMMENT: This will cause your browser to freeze???
          // onEnded={onEnded}
          title={showName}
          subTitle={data.liveSeries.episodes.serialise(episodeObject)}
          extraInfoMedia={`${showName}: ${data.liveSeries.tvShow.season} ${season} ${data.liveSeries.tvShow.episode} ${episode}`}
          // config={{
          //   file: {
          //     tracks: [
          //       {
          //         kind: "subtitles",
          //         label: "English",
          //         srcLang: "en",
          //         src: `${urlBase}liveseries/subtitles/${path}`,
          //         default: true,
          //       },
          //     ],
          //   },
          // }}
        ></ReactNetflixPlayer>
      </div>
    </div>
  );
}

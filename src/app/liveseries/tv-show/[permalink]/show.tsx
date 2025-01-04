"use client";

import { ReactNode, useState } from "react";
import Carousel from "@/components/carousel";
import type { Language } from "@/lib/enums";
import type {
  Episode as EpisodeType,
  TvShowDetails,
  User,
  WatchedEpisodes,
} from "@/lib/types";
import { getEpisodeAirDate, isInvalidDate } from "@/lib/util";
import TvShowSkeleton from "@/components/liveseries/tv-show-skeleton";
import InputBox from "@/components/forms/input-box";
import { useModals } from "@/context/modal-context";
import { TRANSLATIONS } from "@/lib/translations";
import { clientToApi } from "@/lib/backend/client";
import { TvShowContext } from "./context";

// Will issue a warning when trying to subscribe with more than 10 unwatched episodes
const UNWATCHED_EPISODES_THRESHOLD = 10;

export function ShowDetails({
  tvShowDetails,
  user,
  userLanguage,
  liked,
  subscribed,
  watchedEpisodes,
  accessToken,
  children,
}: {
  tvShowDetails: TvShowDetails;
  user: User | null;
  userLanguage: Language;
  liked: boolean;
  subscribed: boolean;
  watchedEpisodes: WatchedEpisodes;
  accessToken: string | null;
  children: ReactNode;
}) {
  const [numImagesLoaded, setNumImagesLoaded] = useState(0);
  const [isLiked, setIsLiked] = useState(liked);
  const [isSubscribed, setIsSubscribed] = useState(subscribed);
  const [watchedInShow, setWatchedInShow] = useState(watchedEpisodes);
  const { setModalChoice, setModalError } = useModals();
  const data = TRANSLATIONS[userLanguage];

  function formatDate(which: "start" | "end") {
    const latestEpisode = tvShowDetails?.episodes?.at(-1);
    const dateString = tvShowDetails?.[`${which}_date`];
    if (!dateString) {
      if (which === "end" && latestEpisode) {
        const latestEpisodeAirDate = getEpisodeAirDate(latestEpisode);
        if (latestEpisodeAirDate > new Date())
          return data.liveSeries.tvShow.present;
        return data.dateShortFormat.format(latestEpisodeAirDate);
      }

      return data.liveSeries.tvShow[
        which === "end" && tvShowDetails?.status === "Running"
          ? "present"
          : "unknown"
      ];
    }
    const date = new Date(dateString);
    if (isInvalidDate(date)) return dateString;
    return data.dateShortFormat.format(date);
  }

  function promptLogin() {
    setModalError(data.liveSeries.home.login);
  }

  async function handleLike() {
    if (!accessToken) {
      return promptLogin();
    }
    setIsLiked((old) => !old);

    const result = await clientToApi(
      "liveseries/shows/personal/liked/" + tvShowDetails?.id,
      accessToken,
      {
        method: isLiked ? "DELETE" : "POST",
        userLanguage,
        setModalError,
      },
    );
    if (!result.ok) setIsLiked((old) => !old);
  }

  async function handleSubscribe() {
    if (!accessToken) {
      return promptLogin();
    }
    if (
      !isSubscribed &&
      unwatchedEpisodesCount > UNWATCHED_EPISODES_THRESHOLD
    ) {
      const proceed = await setModalChoice(
        data.liveSeries.tvShow.confirmSubscribe(unwatchedEpisodesCount),
      );
      if (!proceed) return;
    }

    setIsSubscribed((old) => !old);
    const result = await clientToApi(
      "liveseries/shows/personal/subscribed/" + tvShowDetails?.id,
      accessToken,
      {
        method: isSubscribed ? "DELETE" : "POST",
        userLanguage,
        setModalError,
      },
    );
    if (!result.ok) {
      setIsSubscribed(subscribed);
    }
  }

  async function updateWatchedEpisodes(
    season: string,
    episodes: EpisodeType[],
  ) {
    if (!accessToken) {
      return promptLogin();
    }
    const episodeNumbers = episodes.map((episode) => episode.episode);
    setWatchedInShow((old) => ({
      ...old,
      [season]: episodeNumbers,
    }));
    const result = await clientToApi(
      `liveseries/watched-episodes/personal/${tvShowDetails.id}/${season}`,
      accessToken,
      {
        method: "PUT",
        body: episodeNumbers,
      },
    );
    if (!result.ok) {
      setWatchedInShow(watchedEpisodes);
    }
  }

  if (!tvShowDetails) return <TvShowSkeleton />;

  const isSeasonWatched = (season: string, episodes: EpisodeType[]) =>
    watchedInShow[+season]?.length === episodes.length;

  const totalEpisodes = tvShowDetails?.episodes?.length ?? 0;
  const watchedEpisodesCount = Object.values(watchedInShow).reduce(
    (acc, episodes) => acc + episodes.length,
    0,
  );
  const unwatchedEpisodesCount = totalEpisodes - watchedEpisodesCount;

  const imagesLoading = numImagesLoaded < tvShowDetails.pictures.length;
  console.log({ imagesLoading });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-3">
        <i
          className={`clickable fa-${isLiked ? "solid text-error" : "regular text-background-soft"} fa-heart text-3xl`}
          title={data.liveSeries.tvShow[isLiked ? "unlike" : "like"]}
          onClick={handleLike}
        ></i>
        <h2 className="text-2xl font-bold text-accent-soft">
          {tvShowDetails.name}
        </h2>
        <small className="text-xl">
          ({formatDate("start")} – {formatDate("end")})
        </small>
      </div>
      <div className="my-1 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {tvShowDetails.genres.map((genre, idx) => (
            <div
              key={`genre-${genre}-${idx}`}
              className="clickable whitespace-nowrap rounded-md bg-primary px-2 text-background"
              style={{ cursor: "default" }}
            >
              {genre}
            </div>
          ))}
        </div>
        {tvShowDetails.rating ? (
          <div className="flex items-center gap-2">
            <div
              className="stars"
              title={`${(+tvShowDetails.rating).toFixed(1)}/10`}
            >
              <div
                className="absolute flex text-accent2"
                style={{ width: `${+tvShowDetails.rating * 10}%` }}
              >
                {Array(10)
                  .fill(0)
                  .map((_, idx) => (
                    <i
                      key={`star-filled-${idx}`}
                      className="fa-solid fa-star"
                    ></i>
                  ))}
              </div>
              <div className="flex">
                {Array(10)
                  .fill(0)
                  .map((_, idx) => (
                    <i
                      key={`star-empty-${idx}`}
                      className="fa-regular fa-star"
                    ></i>
                  ))}
              </div>
            </div>
            <span>({tvShowDetails.rating_count})</span>
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-xl">
        <i className="serif regular">{tvShowDetails.network}</i> (
        {tvShowDetails.country}) | {tvShowDetails.runtime} min
      </p>
      <blockquote
        className="mb-2 mt-1"
        dangerouslySetInnerHTML={{
          // Trim description end from line breaks
          __html: tvShowDetails.description.replace(/(\<br\s?\>|\\n|\s)*$/, ""),
        }}
      ></blockquote>
      <small>
        {data.liveSeries.tvShow.source}:{" "}
        {tvShowDetails.description_source ? (
          <a href={tvShowDetails.description_source}>
            {decodeURI(tvShowDetails.description_source)}
          </a>
        ) : (
          data.liveSeries.tvShow.unknown.toLowerCase()
        )}
      </small>
      {tvShowDetails.youtube_link && (
        <div className="embed">
          <iframe
            src={`https://www.youtube.com/embed/${tvShowDetails.youtube_link}`}
          ></iframe>
        </div>
      )}
      {tvShowDetails.pictures.length > 0 && (
        <>
          <h3 className="my-5 text-2xl font-bold">
            {data.liveSeries.tvShow.images}
          </h3>
          <Carousel
            className="gallery"
            images={tvShowDetails.pictures}
            onLoadImage={() => setNumImagesLoaded((old) => old + 1)}
          />
        </>
      )}
      <h3 className="my-5 text-2xl font-bold">
        {data.liveSeries.tvShow.episodes}
      </h3>
      {user?.serverUrl?.length && (
        <div style={{ width: "fit-content" }}>
          <InputBox
            type="checkbox"
            label={data.liveSeries.tvShow.subscribe}
            value={isSubscribed}
            setValue={handleSubscribe}
          ></InputBox>
        </div>
      )}
      {tvShowDetails.episodes.length === 0 ? (
        <p>{data.liveSeries.tvShow.noEpisodes}</p>
      ) : null}
      <TvShowContext.Provider
        value={{ updateWatchedEpisodes, isSeasonWatched }}
      >
        {children}
      </TvShowContext.Provider>
    </div>
  );
}

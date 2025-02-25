"use client";

import type { ReactNode } from "react";
import type { Episode as TvMazeEpisode, Show as TvMazeShow } from "tvmaze-wrapper-ts";
import Image from "next/image";
import { useState } from "react";
import { HeartIcon, StarIcon } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { User } from "@/lib/types";
import type { WatchedEpisodes } from "@/payload-types";
import { InputBox } from "@/components/forms/input-box";
import { TvShowSkeleton } from "@/components/liveseries/tv-show-skeleton";
import { clientToApi } from "@/lib/backend/client";
import { useModals } from "@/lib/context/modal-context";
import { TvShowContext } from "@/lib/context/tv-show-context";
import { TRANSLATIONS } from "@/lib/translations";
import { getEpisodeAirDate, isInvalidDate } from "@/lib/util";
import { cn } from "@/lib/utils";
import { Badge } from "@/ui/badge";

/** Will issue a warning when trying to subscribe with more than 10 unwatched episodes. */
const UNWATCHED_EPISODES_THRESHOLD = 10;

export function ShowDetails({
  tvShow,
  episodes,
  user,
  userLanguage,
  liked,
  subscribed,
  watchedEpisodes,
  accessToken,
  children,
}: {
  tvShow: TvMazeShow;
  episodes: TvMazeEpisode[];
  user: User | null;
  userLanguage: Language;
  liked: boolean;
  subscribed: boolean;
  watchedEpisodes: WatchedEpisodes[number];
  accessToken: string | null;
  children: ReactNode;
}) {
  const [isLiked, setIsLiked] = useState(liked);
  const [isSubscribed, setIsSubscribed] = useState(subscribed);
  const [watchedInShow, setWatchedInShow] = useState(watchedEpisodes);
  const { setModalChoice, setModalError } = useModals();
  const data = TRANSLATIONS[userLanguage];

  function formatDate(which: "start" | "end") {
    const latestEpisode = episodes?.at(-1);
    if (which === "end") {
      if (!latestEpisode) {
        return data.liveSeries.tvShow[
          tvShow?.status === "Running" ? "present" : "unknown"
        ];
      }
      const latestEpisodeAirDate = getEpisodeAirDate(latestEpisode);
      if (latestEpisodeAirDate > new Date()) return data.liveSeries.tvShow.present;
      return data.format.dateShort.format(latestEpisodeAirDate);
    }
    const dateString = tvShow?.premiered;
    if (!dateString) {
      return data.liveSeries.tvShow.unknown;
    }
    const date = new Date(dateString);
    if (isInvalidDate(date)) return dateString;
    return data.format.dateShort.format(date);
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
      "liveseries/shows/personal/liked/" + tvShow?.id,
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
    if (!isSubscribed && unwatchedEpisodesCount > UNWATCHED_EPISODES_THRESHOLD) {
      const proceed = await setModalChoice(
        data.liveSeries.tvShow.confirmSubscribe(unwatchedEpisodesCount),
      );
      if (!proceed) return;
    }

    setIsSubscribed((old) => !old);
    const result = await clientToApi(
      "liveseries/shows/personal/subscribed/" + tvShow?.id,
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

  async function updateWatchedEpisodes(season: string, episodes: TvMazeEpisode[]) {
    if (!accessToken) {
      return promptLogin();
    }
    const episodeNumbers = episodes.map((episode) => episode.number);
    setWatchedInShow((old) => ({
      ...old,
      [+season]: episodeNumbers,
    }));
    const result = await clientToApi(
      `liveseries/watched-episodes/personal/${tvShow.id}/${season}`,
      accessToken,
      {
        method: "PUT",
        body: episodeNumbers,
        userLanguage,
        setModalError,
      },
    );
    if (!result.ok) {
      setWatchedInShow(watchedEpisodes);
    }
  }

  if (!tvShow) return <TvShowSkeleton />;

  const isSeasonWatched = (season: string, episodes: TvMazeEpisode[]) =>
    watchedInShow[+season]?.length === episodes.length;

  const totalEpisodes = episodes?.length ?? 0;
  const watchedEpisodesCount = Object.values(watchedInShow).reduce(
    (acc, episodes) => acc + episodes.length,
    0,
  );
  const unwatchedEpisodesCount = totalEpisodes - watchedEpisodesCount;

  const runtime = tvShow?.runtime ?? tvShow?.averageRuntime;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className={cn("clickable text-3xl", { "text-error": isLiked })}
          title={data.liveSeries.tvShow[isLiked ? "unlike" : "like"]}
          onClick={handleLike}
        >
          <HeartIcon fill={isLiked ? "currentColor" : "none"} />
        </button>
        <h2 className="text-accent-soft text-2xl font-bold">{tvShow.name}</h2>
        <small className="text-xl">
          ({formatDate("start")}–{formatDate("end")})
        </small>
      </div>
      <div className="my-1 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {tvShow.genres.map((genre, idx) => (
            <Badge key={`genre-${genre}-${idx}`}>{genre}</Badge>
          ))}
        </div>
        {tvShow.rating?.average ? (
          <div className="flex items-center gap-2">
            <div className="relative" title={`${(+tvShow.rating.average).toFixed(1)}/10`}>
              <div className="group text-accent2 absolute w-full">
                <div className="grid w-fit grid-cols-10 sm:gap-1">
                  {Array(Math.floor(+tvShow.rating.average))
                    .fill(0)
                    .map((_, idx) => (
                      <StarIcon key={`star-filled-${idx}`} fill="currentColor"></StarIcon>
                    ))}
                  <div
                    className="overflow-hidden"
                    style={{
                      width: `${(+tvShow.rating.average % 1) * 100}%`,
                    }}
                  >
                    <StarIcon fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="text-background-soft grid grid-cols-10 sm:gap-1">
                {Array(10)
                  .fill(0)
                  .map((_, idx) => (
                    <StarIcon key={`star-empty-${idx}`}></StarIcon>
                  ))}
              </div>
            </div>
            <span className="text-xs sm:text-sm">({tvShow.rating.average})</span>
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-xl">
        <i className="font-serif font-normal">{tvShow.network?.name}</i>{" "}
        {tvShow.network?.country ? `(${tvShow.network.country.code}) | ` : ""}
        {runtime ? `${runtime} min` : ""}
      </p>
      <label className="border-background-soft mt-1 mb-2 rounded-sm border-l-[5px] pl-2.5 text-sm sm:text-base md:text-lg">
        <input type="checkbox" className="peer hidden" />
        <blockquote
          className="line-clamp-6 cursor-s-resize peer-checked:line-clamp-none peer-checked:cursor-n-resize"
          dangerouslySetInnerHTML={{
            // Trim description end from line breaks
            __html: tvShow.summary.replace(/(<br\s?>|\\n|\s)*$/, ""),
          }}
        />
      </label>
      <small className="text-xs md:text-sm">
        {data.liveSeries.tvShow.source}: {/* TODO: ?? */}
        {/* {tvShow.description_source ? (
          <Link href={tvShow.description_source} className="hover-underline text-accent">
            {decodeURI(tvShow.description_source)}
          </Link>
        ) : ( */}
        {data.liveSeries.tvShow.unknown.toLowerCase()}
        {/* )} */}
      </small>
      {/* {tvShow.youtube_link && (
        <div className="mt-5 flex w-full justify-center">
          <iframe
            className="aspect-16/9 h-auto w-full md:w-3/4 lg:w-1/2"
            src={`https://www.youtube.com/embed/${tvShow.youtube_link}`}
          ></iframe>
        </div>
      )} */}
      {/* {tvShow.pictures.length > 0 && ( */}
      <>
        {/* <h3 className="my-5 text-2xl font-bold">{data.liveSeries.tvShow.images}</h3> */}
        {/* <ImageGallery
            className="gallery"
            images={tvShowDetails.pictures}
            onLoadImage={() => {}}
          /> */}
        {/* <div className="flex justify-center">
            <Carousel className="sm:min-h-[300px] sm:max-w-[400px]">
              <CarouselContent>
                {tvShow.pictures.map((url, idx) => (
                  <CarouselItem
                    key={`image-${idx}`}
                    className="flex max-w-fit items-center"
                  >
                    <Image
                      src={url}
                      alt={`Gallery image ${idx + 1}`}
                      width={1000}
                      height={600}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselArrows data={data} />
            </Carousel>
          </div> */}
      </>
      {/* )} */}
      {tvShow.image?.original && (
        <Image
          src={tvShow.image?.original}
          alt={tvShow.name}
          width={300}
          height={600}
          className="mx-auto"
        />
      )}
      <h3 className="my-5 text-2xl font-bold">{data.liveSeries.tvShow.episodes}</h3>
      {user?.serverUrl != null && user.serverUrl.length > 0 && (
        <div className="w-fit">
          <InputBox
            type="checkbox"
            label={data.liveSeries.tvShow.subscribe}
            value={isSubscribed}
            setValue={handleSubscribe}
          ></InputBox>
        </div>
      )}
      {totalEpisodes === 0 ? <p>{data.liveSeries.tvShow.noEpisodes}</p> : null}
      <TvShowContext.Provider value={{ updateWatchedEpisodes, isSeasonWatched }}>
        {children}
      </TvShowContext.Provider>
    </div>
  );
}

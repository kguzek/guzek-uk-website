"use client";

import type { ReactNode } from "react";
import type { Episode as TvMazeEpisode, Show as TvMazeShow } from "tvmaze-wrapper-ts";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { Glow } from "@codaworks/react-glow";
import { Dot, HeartIcon, StarIcon, TriangleAlert } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { Numeric } from "@/lib/types";
import type { User } from "@/payload-types";
import { showErrorToast } from "@/components/error/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  getUserLikedShows,
  updateUserShowLike,
  updateUserShowSubscription,
} from "@/lib/backend/liveseries";
import { useLiveSeriesContext } from "@/lib/context/liveseries-context";
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
  children,
}: {
  tvShow: TvMazeShow;
  episodes: TvMazeEpisode[];
  user: User | null;
  userLanguage: Language;
  children: ReactNode;
}) {
  const [isUpdating, startTransition] = useTransition();
  const [isLiked, setIsLiked] = useState(
    (user != null && getUserLikedShows(user).includes(tvShow.id)) ?? false,
  );
  const [isLikedOptimistic, setIsLikedOptimistic] = useOptimistic(isLiked);
  const [isSubscribed, setIsSubscribed] = useState(
    (user != null && user.userShows?.subscribed?.includes(tvShow.id)) ?? false,
  );
  const [isSubscribedOptimistic, setIsSubscribedOptimistic] = useOptimistic(isSubscribed);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const data = TRANSLATIONS[userLanguage];
  const router = useRouter();
  const { watchedEpisodes, updateUserWatchedEpisodes } = useLiveSeriesContext();
  const watchedInShow = watchedEpisodes?.[tvShow.id] ?? {};

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
    showErrorToast(data.liveSeries.home.login);
  }

  function handleLike() {
    if (user == null) {
      promptLogin();
      return;
    }
    const newValue = !isLikedOptimistic;
    startTransition(async () => {
      setIsLikedOptimistic(newValue);
      if (await updateUserShowLike(user, userLanguage, tvShow.id, newValue)) {
        setIsLiked(newValue);
      }
    });
  }

  async function handleSubscribe() {
    setIsSubscribeModalOpen(false);
    // This code should only be reachable if the user is logged in
    if (user == null) {
      showErrorToast(data.unknownError);
      console.error("User is null in ShowDetails handleSubscribe");
      return;
    }
    const newValue = !isSubscribedOptimistic;
    startTransition(async () => {
      setIsSubscribedOptimistic(newValue);
      if (await updateUserShowSubscription(user, userLanguage, tvShow.id, newValue)) {
        setIsSubscribed(newValue);
      }
    });
  }

  function updateWatchedEpisodes(season: Numeric, episodes: TvMazeEpisode[]) {
    if (user == null) {
      promptLogin();
      return;
    }
    return updateUserWatchedEpisodes(
      tvShow.id,
      season,
      episodes.map((episode) => episode.number),
    );
  }

  const isSeasonWatched = (season: Numeric, episodes: TvMazeEpisode[]) =>
    watchedInShow[+season]?.length === episodes.length;

  const totalEpisodes = episodes?.length ?? 0;
  const watchedEpisodesCount = Object.values(watchedInShow).reduce(
    (acc, episodes) => acc + episodes.length,
    0,
  );
  const unwatchedEpisodesCount = totalEpisodes - watchedEpisodesCount;

  const runtime = tvShow.runtime ?? tvShow.averageRuntime;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-3">
        <Glow className="grid place-items-center">
          <button
            className={cn("glow:text-error text-3xl", {
              "text-error": isLikedOptimistic,
            })}
            title={data.liveSeries.tvShow[isLikedOptimistic ? "unlike" : "like"]}
            disabled={isUpdating}
            onClick={handleLike}
          >
            <HeartIcon fill={isLikedOptimistic ? "currentColor" : "none"} />
          </button>
        </Glow>
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
      <p className="mt-2 flex items-center gap-1 text-xl">
        {tvShow.network ? (
          <span className="flex items-center gap-2">
            <i className="font-serif font-normal">{tvShow.network.name}</i> (
            {tvShow.network.country.code})
          </span>
        ) : null}
        {runtime ? (
          <>
            <Dot /> {runtime} min
          </>
        ) : null}
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
      <AlertDialog open={isSubscribeModalOpen}>
        <AlertDialogTrigger asChild className="self-start">
          <Button
            variant={isSubscribed ? "default" : "glow"}
            loading={isUpdating}
            className="min-w-xs"
            onClick={() => {
              if (user == null) {
                promptLogin();
                return;
              }
              if (user.serverUrl == null || user.serverUrl.length === 0) {
                showErrorToast(data.liveSeries.setup, {
                  action: {
                    label: data.profile.title,
                    onClick: () => {
                      router.push("/profile?focus=serverUrl");
                    },
                  },
                });
                return;
              }
              if (
                isSubscribedOptimistic ||
                unwatchedEpisodesCount <= UNWATCHED_EPISODES_THRESHOLD
              ) {
                handleSubscribe();
                return;
              }
              setIsSubscribeModalOpen(true);
            }}
          >
            {isSubscribed
              ? data.liveSeries.tvShow.unsubscribe
              : data.liveSeries.tvShow.subscribe}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{data.liveSeries.tvShow.confirmSubscribe}</AlertDialogTitle>
            <AlertDialogDescription className="flex gap-2">
              <TriangleAlert className="text-accent2" size={18} />{" "}
              {data.liveSeries.tvShow.unwatchedEpisodes(unwatchedEpisodesCount)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              onClick={() => setIsSubscribeModalOpen(false)}
            >
              {data.modal.no}
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleSubscribe}>
              {data.modal.yes}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {totalEpisodes === 0 ? <p>{data.liveSeries.tvShow.noEpisodes}</p> : null}
      <TvShowContext.Provider
        value={{ updateWatchedEpisodes, isSeasonWatched, isUpdating }}
      >
        {children}
      </TvShowContext.Provider>
    </div>
  );
}

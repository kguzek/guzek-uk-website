"use client";

import { Fragment, useState } from "react";
import Carousel from "@/components/carousel";
import { EpisodesList } from "@/components/liveseries/episodes-list";
import { ErrorCode } from "@/lib/enums";
import type { Language } from "@/lib/enums";
import type {
  Episode as EpisodeType,
  TvShowDetails,
  User,
  WatchedEpisodes,
} from "@/lib/types";
import { getEpisodeAirDate, hasEpisodeAired, isInvalidDate } from "@/lib/util";
import { ErrorComponent } from "@/components/error-component";
import TvShowSkeleton from "@/components/liveseries/tv-show-skeleton";
import InputBox from "@/components/forms/input-box";
import { useFetch } from "@/context/fetch-context";
import { useModals } from "@/context/modal-context";
import { useLiveSeries } from "@/context/liveseries-context";
import { TRANSLATIONS } from "@/lib/translations";

// Will issue a warning when trying to subscribe with more than 10 unwatched episodes
const UNWATCHED_EPISODES_THRESHOLD = 10;

export function ShowDetails({
  tvShowDetails,
  user,
  userLanguage,
  liked,
  subscribed,
  watchedEpisodes,
}: {
  tvShowDetails: TvShowDetails;
  user: User | null;
  userLanguage: Language;
  liked: boolean;
  subscribed: boolean;
  watchedEpisodes: WatchedEpisodes;
}) {
  const [numImagesLoaded, setNumImagesLoaded] = useState(0);
  const [isLiked, setIsLiked] = useState(liked);
  const [isSubscribed, setIsSubscribed] = useState(subscribed);
  const [watchedInShow, setWatchedInShow] = useState(watchedEpisodes);
  const { fetchResource } = useLiveSeries();
  const { removeOldCaches } = useFetch();
  const { setModalChoice } = useModals();
  const data = TRANSLATIONS[userLanguage];

  function sortEpisodes(episodes: EpisodeType[]) {
    const seasons: { [season: number]: EpisodeType[] } = {};
    for (const episode of episodes) {
      const season = episode.season;
      if (seasons[season]) {
        seasons[season].push(episode);
      } else {
        seasons[season] = [episode];
      }
    }
    return Object.entries(seasons);
  }

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

  async function handleLike() {
    setIsLiked((old) => !old);

    await fetchResource("shows/personal/liked/" + tvShowDetails?.id, {
      method: isLiked ? "DELETE" : "POST",
      onSuccess: () => removeOldCaches(),
      onError: () => setIsLiked((old) => !old),
      useEpisodate: false,
    });
  }

  async function handleSubscribe() {
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

    await fetchResource("shows/personal/subscribed/" + tvShowDetails?.id, {
      method: isSubscribed ? "DELETE" : "POST",
      onSuccess: () => removeOldCaches(),
      onError: () => setIsSubscribed((old) => !old),
      useEpisodate: false,
    });
  }

  function updateWatchedEpisodes(season: string, episodes: EpisodeType[]) {
    const episodeNumbers = episodes.map((episode) => episode.episode);
    fetchResource(`watched-episodes/personal/${tvShowDetails.id}/${season}`, {
      method: "PUT",
      onSuccess: () => removeOldCaches(),
      onError: () => setWatchedInShow(watchedEpisodes),
      body: episodeNumbers,
      useEpisodate: false,
    });
    setWatchedInShow((old) => ({
      ...old,
      [season]: episodeNumbers,
    }));
  }

  if (
    tvShowDetails === undefined ||
    (Array.isArray(tvShowDetails) && tvShowDetails.length === 0)
  ) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
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

  return (
    <div className={`details ${imagesLoading ? "display-none" : ""}`}>
      <h2 className="flex flex-wrap gap-10">
        <i
          className={`clickable fa-${isLiked ? "solid" : "regular"} fa-heart`}
          title={data.liveSeries.tvShow[isLiked ? "unlike" : "like"]}
          onClick={handleLike}
        ></i>
        <span>{tvShowDetails.name}</span>
        <small className="regular">
          ({formatDate("start")} – {formatDate("end")})
        </small>
      </h2>
      <div className="flex flex-wrap">
        <div className="genres flex">
          {tvShowDetails.genres.map((genre, idx) => (
            <div
              key={`genre-${genre}-${idx}`}
              className="genre nowrap"
              style={{ cursor: "default" }}
            >
              {genre}
            </div>
          ))}
        </div>
        {tvShowDetails.rating ? (
          <div className="flex">
            <div
              className="stars"
              title={`${(+tvShowDetails.rating).toFixed(1)}/10`}
            >
              <div
                className="stars-filled flex"
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
              <div className="stars-empty flex">
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
      <p>
        <i className="serif regular">{tvShowDetails.network}</i> (
        {tvShowDetails.country}) | {tvShowDetails.runtime} min
      </p>
      <blockquote
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
          <h3>{data.liveSeries.tvShow.images}</h3>
          <Carousel
            className="gallery"
            images={tvShowDetails.pictures}
            onLoadImage={() => setNumImagesLoaded((old) => old + 1)}
          />
        </>
      )}
      <h3>{data.liveSeries.tvShow.episodes}</h3>
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
      {tvShowDetails.episodes.length === 0 ? <p>No episodes to list.</p> : null}
      {sortEpisodes(tvShowDetails.episodes).map(([season, episodes]) => {
        const allEpisodesAired = episodes.every(hasEpisodeAired);
        const seasonWatched = isSeasonWatched(season, episodes);
        return (
          <Fragment key={`season-${season}`}>
            <EpisodesList
              tvShow={tvShowDetails}
              heading={`${data.liveSeries.tvShow.season} ${season}`}
              episodes={episodes}
            >
              <div className="centred">
                {allEpisodesAired ? (
                  <div
                    title={data.liveSeries.tvShow.markAllWatched(
                      seasonWatched ? data.liveSeries.tvShow.un : "",
                    )}
                    onClick={() =>
                      updateWatchedEpisodes(
                        season,
                        seasonWatched ? [] : episodes,
                      )
                    }
                  >
                    <i
                      className={`clickable fas fa-eye${
                        seasonWatched ? "" : "-slash"
                      }`}
                    ></i>
                  </div>
                ) : (
                  <i className="fa-regular fa-clock"></i>
                )}
              </div>
            </EpisodesList>
          </Fragment>
        );
      })}
    </div>
  );
}

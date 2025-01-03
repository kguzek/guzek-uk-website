import React, { useContext, useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import Carousel from "../../components/Carousel/Carousel";
import EpisodesList from "../../components/LiveSeries/EpisodesList";
import {
  Episode as EpisodeType,
  ErrorCode,
  TvShowDetails,
} from "../../misc/models";
import {
  AuthContext,
  ModalContext,
  TranslationContext,
  useFetchContext,
} from "../../misc/context";
import {
  getEpisodeAirDate,
  hasEpisodeAired,
  isInvalidDate,
  setTitle,
} from "../../misc/util";
import ErrorPage from "../ErrorPage";
import { LiveSeriesOutletContext } from "./Base";
import TvShowSkeleton from "../../components/LiveSeries/TvShowSkeleton";
import InputBox from "../../components/Forms/InputBox";

// Will issue a warning when trying to subscribe with more than 10 unwatched episodes
const UNWATCHED_EPISODES_THRESHOLD = 10;

export default function TvShow() {
  const [numImagesLoaded, setNumImagesLoaded] = useState(0);
  const [likedFlipped, setLikedFlipped] = useState(false);
  const [subscribedFlipped, setSubscribedFlipped] = useState(false);
  const [tvShowDetails, setTvShowDetails] = useState<
    null | TvShowDetails | undefined
  >(null);
  const data = useContext(TranslationContext);
  const { user } = useContext(AuthContext);
  const { userShows, watchedEpisodes, setWatchedEpisodes, fetchResource } =
    useOutletContext<LiveSeriesOutletContext>();
  const { removeOldCaches } = useFetchContext();
  const { permalink } = useParams();
  const { setModalChoice } = useContext(ModalContext);

  useEffect(() => {
    if (!permalink) return;

    fetchResource("show-details", {
      params: { q: permalink },
      onSuccess: (json) => setTvShowDetails(json.tvShow),
      onError: () => setTvShowDetails(undefined),
    });
  }, [permalink]);

  useEffect(() => {
    setTitle(
      `${tvShowDetails?.name || data.liveSeries.tvShow.showDetails} – ${
        data.liveSeries.title
      }`
    );
  }, [data, tvShowDetails]);

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
    setLikedFlipped((old) => !old);

    await fetchResource("shows/personal/liked/" + tvShowDetails?.id, {
      method: isLiked ? "DELETE" : "POST",
      onSuccess: () => removeOldCaches(),
      onError: () => setLikedFlipped((old) => !old),
      useEpisodate: false,
    });
  }

  async function handleSubscribe() {
    if (
      !isSubscribed &&
      unwatchedEpisodesCount > UNWATCHED_EPISODES_THRESHOLD
    ) {
      const proceed = await setModalChoice(
        data.liveSeries.tvShow.confirmSubscribe(unwatchedEpisodesCount)
      );
      if (!proceed) return;
    }

    setSubscribedFlipped((old) => !old);

    await fetchResource("shows/personal/subscribed/" + tvShowDetails?.id, {
      method: isSubscribed ? "DELETE" : "POST",
      onSuccess: () => removeOldCaches(),
      onError: () => setSubscribedFlipped((old) => !old),
      useEpisodate: false,
    });
  }

  function updateWatchedEpisodes(season: string, episodes: EpisodeType[]) {
    if (!tvShowDetails) return;
    const episodeNumbers = episodes.map((episode) => episode.episode);
    fetchResource(`watched-episodes/personal/${tvShowDetails.id}/${season}`, {
      method: "PUT",
      onSuccess: () => removeOldCaches(),
      onError: () => setWatchedEpisodes(watchedEpisodes),
      body: episodeNumbers,
      useEpisodate: false,
    });
    setWatchedEpisodes((old) => ({
      ...old,
      [tvShowDetails.id]: {
        ...old?.[tvShowDetails.id],
        [season]: episodeNumbers,
      },
    }));
  }

  if (
    tvShowDetails === undefined ||
    (Array.isArray(tvShowDetails) && tvShowDetails.length === 0)
  ) {
    return <ErrorPage errorCode={ErrorCode.NotFound} />;
  }

  if (!tvShowDetails) return <TvShowSkeleton />;

  const isLikedOld =
    tvShowDetails && userShows?.likedShows?.includes(tvShowDetails.id);
  const isLiked = likedFlipped ? !isLikedOld : isLikedOld ?? false;
  const isSubscribedOld =
    tvShowDetails && userShows?.subscribedShows?.includes(tvShowDetails.id);
  const isSubscribed = subscribedFlipped
    ? !isSubscribedOld
    : isSubscribedOld ?? false;
  // console.log({
  //   tvShowDetails,
  //   userShows,
  //   isLikedOld,
  //   isLiked,
  //   isSubscribedOld,
  //   isSubscribed,
  // });
  const watchedInShow = watchedEpisodes?.[tvShowDetails.id] ?? {};
  const isSeasonWatched = (season: string, episodes: EpisodeType[]) =>
    watchedInShow[+season]?.length === episodes.length;

  const totalEpisodes = tvShowDetails?.episodes?.length ?? 0;
  const watchedEpisodesCount = Object.values(watchedInShow).reduce(
    (acc, episodes) => acc + episodes.length,
    0
  );
  const unwatchedEpisodesCount = totalEpisodes - watchedEpisodesCount;

  const imagesLoading = numImagesLoaded < tvShowDetails.pictures.length;

  return (
    <>
      {imagesLoading && <TvShowSkeleton />}
      <div className={`details ${imagesLoading ? "display-none" : ""}`}>
        <h2 className="flex gap-10 flex-wrap">
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
                  className="flex stars-filled"
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
                <div className="flex stars-empty">
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
            __html: tvShowDetails.description.replace(
              /(\<br\s?\>|\\n|\s)*$/,
              ""
            ),
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
        {tvShowDetails.episodes.length === 0 ? (
          <p>No episodes to list.</p>
        ) : null}
        {sortEpisodes(tvShowDetails.episodes).map(([season, episodes]) => {
          const allEpisodesAired = episodes.every(hasEpisodeAired);
          const seasonWatched = isSeasonWatched(season, episodes);
          return (
            <React.Fragment key={`season-${season}`}>
              <EpisodesList
                tvShow={tvShowDetails}
                heading={`${data.liveSeries.tvShow.season} ${season}`}
                episodes={episodes}
              >
                <div className="centred">
                  {allEpisodesAired ? (
                    <div
                      title={data.liveSeries.tvShow.markAllWatched(
                        seasonWatched ? data.liveSeries.tvShow.un : ""
                      )}
                      onClick={() =>
                        updateWatchedEpisodes(
                          season,
                          seasonWatched ? [] : episodes
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
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

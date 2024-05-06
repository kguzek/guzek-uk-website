import React, { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import Carousel from "../../components/Carousel";
import LoadingScreen from "../../components/LoadingScreen";
import Episode from "./Episode";
import { fetchFromEpisodate } from "../../misc/episodate";
import {
  Episode as EpisodeData,
  ErrorCode,
  TvShowDetails,
} from "../../misc/models";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import ErrorPage from "../ErrorPage";
import { OutletContext } from "./Base";

export interface WatchedEpisodes {
  [season: number]: number[];
}

export default function TvShow({ data }: { data: Translation }) {
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [tvShowDetails, setTvShowDetails] = useState<null | TvShowDetails>(
    null
  );
  const [watchedEpisodes, setWatchedEpisodes] = useState<WatchedEpisodes>({});
  const { tvShowId } = useParams();
  const { likedShows, reloadSite, fetchResource } =
    useOutletContext<OutletContext>();

  useEffect(() => {
    if (loading || !tvShowId) return;

    fetchShow(tvShowId);
  }, [tvShowId]);

  useEffect(() => {
    setTitle(tvShowDetails ? tvShowDetails.name : "Show Details");
  }, [data, tvShowDetails]);

  async function fetchShow(tvShowId: string) {
    setLoading(true);
    try {
      const res = await fetchFromEpisodate("show-details", { q: tvShowId });
      const json = await res.json();
      setLoading(false);
      if (res.ok) {
        setTvShowDetails(json.tvShow);
      } else {
        console.error("Received bad response");
      }
    } catch {
      setLoading(false);
    }
  }

  function sortEpisodes(episodes: EpisodeData[]) {
    const seasons: { [season: number]: EpisodeData[] } = {};
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

  if (loading) return <LoadingScreen text={data.loading} />;

  function formatDate(which: "start" | "end") {
    const dateString =
      tvShowDetails?.[`${which}_date`] ||
      (which === "end" && tvShowDetails?.episodes?.at(-1)?.air_date);
    if (!dateString) {
      return data.liveSeries.tvShow[
        which === "end" && tvShowDetails?.status === "Running"
          ? "present"
          : "unknown"
      ];
    }
    const date = new Date(dateString);
    if (date.toString() === "Invalid Date") return dateString;
    return date.toLocaleDateString();
  }

  const isLikedOld = tvShowDetails && likedShows?.includes(tvShowDetails.id);
  const isLiked = flipped ? !isLikedOld : isLikedOld;

  async function handleHeart() {
    setFlipped(!flipped);

    await fetchResource("liked-shows/personal/" + tvShowDetails?.id, {
      method: isLiked ? "DELETE" : "POST",
      onSuccess: () => reloadSite(),
      onError: () => setFlipped((old) => !old),
      useEpisodate: false,
    });
  }

  return tvShowDetails ? (
    <div className="details">
      <h2>
        <i
          className={`fa-${isLiked ? "solid" : "regular"} fa-heart`}
          title={data.liveSeries.tvShow[isLiked ? "unlike" : "like"]}
          onClick={handleHeart}
        ></i>{" "}
        {tvShowDetails.name}{" "}
        <small className="regular">
          ({formatDate("start")}-{formatDate("end")})
        </small>
      </h2>
      <div className="flex flex-wrap">
        <div className="genres flex">
          {tvShowDetails.genres.map((genre, idx) => (
            <div key={`genre-${genre}-${idx}`} className="genre">
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
            /(\s|\<br\s?\>|\\n|\s)*$/,
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
          <Carousel className="gallery" images={tvShowDetails.pictures} />
        </>
      )}
      <h3>{data.liveSeries.tvShow.episodes}</h3>
      {tvShowDetails.episodes.length === 0 ? <p>No episodes to list.</p> : null}
      {sortEpisodes(tvShowDetails.episodes).map(([season, episodes]) => (
        <React.Fragment key={`season-${season}`}>
          <div className="season">
            <h4>
              {data.liveSeries.tvShow.season} {season}
            </h4>
            <div
              className="watched"
              onClick={() =>
                setWatchedEpisodes((old) => ({
                  ...old,
                  [+season]:
                    watchedEpisodes[+season]?.length === episodes.length
                      ? []
                      : episodes.map((episode) => episode.episode),
                }))
              }
            >
              <i
                className={`fas fa-eye${
                  watchedEpisodes[+season]?.length === episodes.length
                    ? ""
                    : "-slash"
                }`}
              ></i>
            </div>
          </div>
          <div className="episodes">
            {episodes.map((episode) => (
              <Episode
                key={`episode-${episode.episode}`}
                data={data}
                episode={episode}
                watchedEpisodes={watchedEpisodes}
                setWatchedEpisodes={setWatchedEpisodes}
              />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  ) : (
    <ErrorPage data={data} errorCode={ErrorCode.NotFound} />
  );
}


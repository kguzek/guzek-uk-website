import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import EpisodesList from "../../components/LiveSeries/EpisodesList";
import TvShowPreview from "../../components/LiveSeries/TvShowPreview";
import TvShowPreviewSkeleton from "../../components/LiveSeries/TvShowPreviewSkeleton";
import { Episode, EpisodeStatuses, TvShowDetails } from "../../misc/models";
import { Translation } from "../../misc/translations";
import {
  hasEpisodeAired,
  scrollToElement,
  setTitle,
  useScroll,
} from "../../misc/util";
import { getLiveSeriesTitle, OutletContext } from "./Base";

// Number of skeleton cards to display when loading liked show ids
const SKELETON_CARDS_COUNT = 4;

interface LikedShows {
  [showId: number]: TvShowDetails;
}

function LikedShowsCarousel({
  data,
  likedShowIds,
  likedShows,
  readyToRenderPreviews,
}: {
  data: Translation;
  likedShowIds: null | number[];
  likedShows: LikedShows;
  readyToRenderPreviews: boolean;
}) {
  const {
    scroll: carouselScroll,
    totalWidth: carouselTotalWidth,
    visibleWidth: carouselVisibleWidth,
  } = useScroll(".scroll-x");

  function getDisplayedCards() {
    const totalCards = likedShowIds?.length ?? SKELETON_CARDS_COUNT;
    const cardWidth = carouselTotalWidth / totalCards;
    const cardsPerPage = Math.floor(carouselVisibleWidth / cardWidth);
    const firstCard = Math.ceil(carouselScroll / cardWidth) + 1;
    const lastCard =
      Math.floor(
        (carouselScroll + carouselVisibleWidth - cardWidth) / cardWidth
      ) + 1;
    const info = {
      firstCard,
      lastCard,
      cardsPerPage,
      totalCards,
    };
    console.log(info);
    return info;
  }

  const scrollToCard = (card: number, inline: ScrollLogicalPosition) =>
    scrollToElement(`.previews li:nth-child(${card})`, inline);

  function previousImage() {
    const { lastCard, cardsPerPage } = getDisplayedCards();
    const card = Math.max(1, lastCard - cardsPerPage);
    scrollToCard(card, "end");
  }

  function nextImage() {
    const { firstCard, cardsPerPage, totalCards } = getDisplayedCards();
    const card = Math.min(totalCards, firstCard + cardsPerPage);
    scrollToCard(card, "start");
  }

  function getScrollerClassName(direction: "left" | "right") {
    const { firstCard, lastCard, totalCards } = getDisplayedCards();
    const visible =
      direction === "left" ? firstCard > 1 : lastCard < totalCards;
    return `${direction} fa-arrow-${direction} ${visible ? "" : "hidden"}`;
  }

  return (
    <div className="flex-column home">
      <div className="flex home-carousel">
        <i
          className={`carousel-scroller fas ${getScrollerClassName("left")}`}
          onClick={previousImage}
        ></i>
        <ul className="previews flex scroll-x">
          {(likedShowIds ?? Array(SKELETON_CARDS_COUNT).fill(0)).map(
            (showId, idx) => (
              <li key={`home-preview ${showId} ${idx}`}>
                {readyToRenderPreviews ? (
                  <TvShowPreview data={data} showDetails={likedShows[showId]} />
                ) : (
                  <TvShowPreviewSkeleton idx={idx} />
                )}
              </li>
            )
          )}
        </ul>
        <i
          className={`carousel-scroller fas ${getScrollerClassName("right")}`}
          onClick={nextImage}
        ></i>
      </div>
      <div className="carousel-indicator-container">
        <div
          className="carousel-indicator"
          style={{
            transform: `translateX(${
              (126 * carouselScroll) /
              (carouselTotalWidth - carouselVisibleWidth)
            }px)`,
          }}
        ></div>
      </div>
    </div>
  );
}

export default function Home({ data }: { data: Translation }) {
  const [likedShows, setLikedShows] = useState<LikedShows>({});
  const title = getLiveSeriesTitle(data, "home");
  const { likedShowIds, watchedEpisodes, loading, fetchResource } =
    useOutletContext<OutletContext>();

  useEffect(() => {
    setTitle(title);
  }, [data]);

  useEffect(() => {
    if (!likedShowIds) return;
    if (likedShowIds.length === Object.keys(likedShows).length) return;
    setLikedShows([]);
    for (const showId of likedShowIds) {
      fetchResource("show-details", {
        params: { q: `${showId}` },
        onSuccess: (showData) => {
          setLikedShows((old) => ({
            ...old,
            [showData.tvShow.id]: showData.tvShow,
          }));
        },
      });
    }
  }, [likedShowIds]);

  function getUnwatchedEpisodes(showId: number) {
    const unwatched = likedShows[showId].episodes.filter(
      (episode) =>
        hasEpisodeAired(episode) &&
        !watchedEpisodes?.[showId]?.[episode.season]?.includes(episode.episode)
    );
    if (unwatched.length > 0) unwatchedEpisodesByShowId[showId] = unwatched;
    return unwatched;
  }

  const readyToRenderPreviews =
    Object.keys(likedShows).length === likedShowIds?.length;

  const unwatchedEpisodesByShowId: { [showId: number]: Episode[] } = {};

  return (
    <>
      <h2>{title}</h2>
      <h3>Your Liked Shows {likedShowIds ? `(${likedShowIds.length})` : ""}</h3>
      {loading.length > 0 || likedShowIds?.length !== 0 ? (
        <>
          <LikedShowsCarousel
            data={data}
            likedShowIds={likedShowIds}
            likedShows={likedShows}
            readyToRenderPreviews={readyToRenderPreviews}
          />
          {likedShowIds && readyToRenderPreviews && (
            <>
              <h3>
                {data.liveSeries.tvShow.unwatched}{" "}
                {data.liveSeries.tvShow.episodes}
              </h3>
              {likedShowIds.map((showId, idx) => {
                const unwatchedEpisodes = getUnwatchedEpisodes(showId);
                if (unwatchedEpisodes.length === 0) return null;
                return (
                  <div key={`liked-show-${showId}-${idx}`}>
                    <EpisodesList
                      data={data}
                      showId={showId}
                      heading={`${likedShows[showId].name} (${unwatchedEpisodes.length})`}
                      episodes={unwatchedEpisodes}
                      episodeStatuses={{}}
                    />
                  </div>
                );
              })}
              {Object.keys(unwatchedEpisodesByShowId).length === 0 && (
                <p>{data.liveSeries.home.noUnwatched}</p>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <p>{data.liveSeries.home.noLikes}</p>
          <p>
            <Link to="search">{data.liveSeries.search.label}</Link>
          </p>
          <p>
            <Link to="most-popular">
              {data.liveSeries.home.explore} {data.liveSeries.mostPopular.title}{" "}
              {data.liveSeries.home.shows}
            </Link>
          </p>
        </>
      )}
    </>
  );
}

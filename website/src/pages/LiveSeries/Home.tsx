import React, { useContext, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { CarouselIndicator } from "../../components/Carousel/Carousel";
import EpisodesList from "../../components/LiveSeries/EpisodesList";
import TvShowPreview from "../../components/LiveSeries/TvShowPreview";
import { Episode, TvShowDetails } from "../../misc/models";
import { TranslationContext } from "../../misc/context";
import {
  hasEpisodeAired,
  scrollToElement,
  setTitle,
  useScroll,
} from "../../misc/util";
import { getLiveSeriesTitle, LiveSeriesOutletContext } from "./Base";

// Number of skeleton cards to display when loading liked show ids
const SKELETON_CARDS_COUNT = 4;

interface LikedShows {
  [showId: number]: TvShowDetails;
}

function LikedShowsCarousel({
  likedShowIds,
  likedShows,
  readyToRenderPreviews,
}: {
  likedShowIds: null | number[];
  likedShows: LikedShows;
  readyToRenderPreviews: boolean;
}) {
  const [cardsToLoad, setCardsToLoad] = useState<number[]>([]);

  const carouselElement = document.querySelector<HTMLElement>(".scroll-x");
  const carouselTotalWidth = carouselElement?.scrollWidth || 1;
  const carouselVisibleWidth = carouselElement?.offsetWidth || 1;

  const { scroll: carouselScroll } = useScroll(carouselElement);

  useEffect(() => {
    if (!likedShowIds) return;
    setCardsToLoad(likedShowIds);
  }, [likedShowIds]);

  function getDisplayedCards() {
    const totalCards = likedShowIds?.length ?? SKELETON_CARDS_COUNT;
    const cardWidth = carouselTotalWidth / totalCards;
    // Predetermined card width doesn't take into account padding/spacing, so using this
    const cardsPerPage = Math.floor(carouselVisibleWidth / cardWidth);
    // Add 0.1 tolerance because we don't want 1.00001 to be ceiled to 2
    const firstCard = Math.ceil(carouselScroll / cardWidth - 0.1) + 1;
    // or 5.99999... to be floored to 5.0
    const lastCard =
      Math.floor(
        (carouselScroll + carouselVisibleWidth - cardWidth) / cardWidth + 0.1
      ) + 1;
    // Not using Math.round because then on small layouts the app will assume
    // we can see the full card when we can only see half of it
    const info = {
      firstCard,
      lastCard,
      cardsPerPage,
      totalCards,
    };
    console.log(
      (carouselScroll + carouselVisibleWidth - cardWidth) / cardWidth,
      lastCard
    );
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
    if (direction === "right") console.log({ firstCard, lastCard, totalCards });
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
                <TvShowPreview
                  idx={idx}
                  showDetails={likedShowIds ? likedShows[showId] : undefined}
                  onLoad={() =>
                    setCardsToLoad((old) =>
                      old.filter((value) => value !== showId)
                    )
                  }
                  ready={cardsToLoad.length === 0 && readyToRenderPreviews}
                />
              </li>
            )
          )}
        </ul>
        <i
          className={`carousel-scroller fas ${getScrollerClassName("right")}`}
          onClick={nextImage}
        ></i>
      </div>
      {carouselTotalWidth > carouselVisibleWidth && (
        <CarouselIndicator
          scrolledWidth={carouselScroll}
          totalWidth={carouselTotalWidth}
          visibleWidth={carouselVisibleWidth}
        />
      )}
    </div>
  );
}

export default function Home() {
  const [likedShows, setLikedShows] = useState<LikedShows>({});
  const data = useContext(TranslationContext);
  const title = getLiveSeriesTitle("home");
  const { likedShowIds, watchedEpisodes, loading, fetchResource } =
    useOutletContext<LiveSeriesOutletContext>();

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

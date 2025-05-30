"use client";

import type { Show as TvMazeShow } from "tvmaze-wrapper-ts";
import { useRef } from "react";

import type { User } from "@/payload-types";
import { CarouselArrow, CarouselIndicator } from "@/components/carousel";
import { TvShowPreview } from "@/components/liveseries/tv-show-preview";
import { getUserShows } from "@/lib/backend/liveseries";
import { useElementScroll } from "@/lib/hooks/element-scroll";
import { scrollToElement } from "@/lib/util";

// Number of skeleton cards to display when loading liked show ids
// const SKELETON_CARDS_COUNT = 4;

export function LikedShowsCarousel({
  likedShows,
  user,
}: {
  likedShows: { [id: number]: TvMazeShow };
  user: User | null;
}) {
  const carouselRef = useRef<HTMLUListElement>(null);

  const {
    scroll: carouselScroll,
    totalWidth: carouselTotalWidth,
    visibleWidth: carouselVisibleWidth,
  } = useElementScroll(carouselRef);

  function getDisplayedCards() {
    const totalCards = getUserShows(user).length;
    const cardWidth = carouselTotalWidth / totalCards;
    // Predetermined card width doesn't take into account padding/spacing, so using this
    const cardsPerPage = Math.floor(carouselVisibleWidth / cardWidth);
    // Add 0.1 tolerance because we don't want 1.00001 to be ceiled to 2
    const firstCard = Math.ceil(carouselScroll / cardWidth - 0.1) + 1;
    // or 5.99999... to be floored to 5.0
    const lastCard =
      Math.floor((carouselScroll + carouselVisibleWidth - cardWidth) / cardWidth + 0.1) +
      1;
    // Not using Math.round because then on small layouts the app will assume
    // we can see the full card when we can only see half of it
    const info = {
      firstCard,
      lastCard,
      cardsPerPage,
      totalCards,
    };
    return info;
  }

  const scrollToCard = (card: number, inline: ScrollLogicalPosition) =>
    scrollToElement(`#previews li:nth-child(${card})`, inline);

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

  function isScrollerVisible(direction: "left" | "right") {
    const { firstCard, lastCard, totalCards } = getDisplayedCards();
    const visible = direction === "left" ? firstCard > 1 : lastCard < totalCards;
    return visible;
  }

  return (
    <div className="relative flex flex-wrap items-center justify-center gap-2">
      <CarouselArrow left onClick={previousImage} isVisible={isScrollerVisible} />
      <ul
        ref={carouselRef}
        id="previews"
        className="no-scrollbar flex w-full gap-4 overflow-x-scroll"
      >
        {getUserShows(user).map((showId, idx) => (
          <li key={`home-preview ${showId} ${idx}`}>
            <TvShowPreview idx={idx} tvShow={likedShows[showId]} user={user} />
          </li>
        ))}
      </ul>
      <CarouselArrow right onClick={nextImage} isVisible={isScrollerVisible} />
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

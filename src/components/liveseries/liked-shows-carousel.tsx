"use client";

import { useEffect, useState } from "react";
import { scrollToElement } from "@/lib/util";
import { CarouselIndicator } from "@/components/carousel";
import { TvShowPreview } from "@/components/liveseries/tv-show-preview";
import { useScroll } from "@/hooks/scroll";
import type { Language, LikedShows } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";
import { useModals } from "@/context/modal-context";

// Number of skeleton cards to display when loading liked show ids
const SKELETON_CARDS_COUNT = 4;

export function LikedShowsCarousel({
  likedShowIds,
  likedShows,
  readyToRenderPreviews,
  userLanguage,
}: {
  likedShowIds?: number[];
  likedShows: LikedShows;
  readyToRenderPreviews: boolean;
  userLanguage: Language;
}) {
  const [cardsToLoad, setCardsToLoad] = useState<number[]>(likedShowIds ?? []);
  const { setModalError } = useModals();

  const data = TRANSLATIONS[userLanguage];

  const carouselElement = document.querySelector<HTMLElement>(".scroll-x");
  const carouselTotalWidth = carouselElement?.scrollWidth || 1;
  const carouselVisibleWidth = carouselElement?.offsetWidth || 1;

  const { scroll: carouselScroll } = useScroll(carouselElement);

  useEffect(() => {
    if (!likedShowIds) {
      // TODO: more specific error message
      setModalError(data.networkError);
    }
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
        (carouselScroll + carouselVisibleWidth - cardWidth) / cardWidth + 0.1,
      ) + 1;
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

  const toMap = likedShowIds ?? Array<number>(SKELETON_CARDS_COUNT).fill(0);
  return (
    <div className="flex-column home">
      <div className="home-carousel flex">
        <i
          className={`carousel-scroller fas ${getScrollerClassName("left")}`}
          onClick={previousImage}
        ></i>
        <ul className="previews scroll-x flex">
          {toMap.map((showId, idx) => (
            <li key={`home-preview ${showId} ${idx}`}>
              <TvShowPreview
                idx={idx}
                showDetails={likedShowIds ? likedShows[showId] : undefined}
                onLoad={() =>
                  setCardsToLoad((old) =>
                    old.filter((value) => value !== showId),
                  )
                }
                ready={cardsToLoad.length === 0 && readyToRenderPreviews}
              />
            </li>
          ))}
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

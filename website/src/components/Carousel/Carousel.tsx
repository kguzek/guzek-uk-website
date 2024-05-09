import React from "react";
import { CAROUSEL_INDICATOR_FULL_WIDTH } from "../../misc/models";
import { scrollToElement, useScroll } from "../../misc/util";
import "./Carousel.css";

export default function Carousel({
  className = "",
  images,
  onLoadImage,
}: {
  className?: string;
  images: string[];
  onLoadImage: () => void;
}) {
  const carouselElement = document.querySelector(".carousel");
  const carouselTotalWidth = carouselElement?.scrollWidth || 1;

  const { scroll: carouselScroll } = useScroll(carouselElement);

  function getSelectedImage() {
    const imageWidth = carouselTotalWidth / images.length;
    return Math.round(carouselScroll / imageWidth) + 1;
  }

  const scrollToImage = (imageNumber: number) =>
    scrollToElement(`#image-${imageNumber}`);

  function previousImage() {
    const selectedImage = getSelectedImage();
    if (selectedImage <= 1) {
      scrollToImage(images.length);
    } else {
      scrollToImage(selectedImage - 1);
    }
  }

  function nextImage() {
    const selectedImage = getSelectedImage();
    if (selectedImage >= images.length) {
      scrollToImage(1);
    } else {
      scrollToImage(selectedImage + 1);
    }
  }

  return (
    <div className="carousel-container flex-wrap">
      <i
        role="button"
        className="carousel-scroller left fas fa-arrow-left"
        onClick={previousImage}
      ></i>
      <div className={`carousel scroll-x ${className}`}>
        {images.map((url, idx) => (
          <img
            key={idx}
            id={`image-${idx + 1}`}
            alt={`gallery image ${idx + 1}`}
            src={url}
            onLoad={onLoadImage}
            onError={onLoadImage}
          />
        ))}
      </div>
      <i
        role="button"
        className="carousel-scroller right fas fa-arrow-right"
        onClick={nextImage}
      ></i>
      <CarouselIndicator
        scrolledWidth={carouselScroll}
        totalWidth={carouselTotalWidth}
        visibleWidth={carouselTotalWidth / images.length}
      />
    </div>
  );
}

export function CarouselIndicator({
  scrolledWidth,
  totalWidth,
  visibleWidth,
}: {
  scrolledWidth: number;
  totalWidth: number;
  visibleWidth: number;
}) {
  const width = (CAROUSEL_INDICATOR_FULL_WIDTH * visibleWidth) / totalWidth;

  const percentageScrolled = scrolledWidth / (totalWidth - visibleWidth);

  return (
    <div className="carousel-indicator-container">
      <div
        className="carousel-indicator"
        style={{
          width,
          transform: `translateX(${
            (CAROUSEL_INDICATOR_FULL_WIDTH - width) * percentageScrolled
          }px)`,
        }}
      ></div>
    </div>
  );
}


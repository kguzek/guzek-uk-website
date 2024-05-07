import React, { useEffect } from "react";
import { scrollToElement, useScroll } from "../misc/util";
import "../styles/carousel.css";

export default function Carousel({
  className = "",
  images,
}: {
  className?: string;
  images: string[];
}) {
  const { scroll: carouselScroll, totalWidth: carouselTotalWidth } =
    useScroll(".carousel");

  useEffect(() => {
    const scrolled =
      ((carouselScroll / carouselTotalWidth) * images.length) /
      (images.length - 1);
    const carouselIndicator = document.querySelector<HTMLElement>(
      ".carousel-indicator"
    );
    if (!carouselIndicator) return;
    carouselIndicator.style.transform = `translateX(${
      (140 - 14) * scrolled
    }px)`;
  }, [carouselScroll]);

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
            alt={`image-${idx + 1}`}
            src={url}
          />
        ))}
      </div>
      <i
        role="button"
        className="carousel-scroller right fas fa-arrow-right"
        onClick={nextImage}
      ></i>
      <div className="carousel-indicator-container">
        <div className="carousel-indicator"></div>
      </div>
    </div>
  );
}


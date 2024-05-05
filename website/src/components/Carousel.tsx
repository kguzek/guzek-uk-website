import React, { useEffect } from "react";
import "../styles/carousel.css";

export default function Carousel({
  className = "",
  images,
}: {
  className?: string;
  images: string[];
}) {
  useEffect(() => {
    const carousel = document.querySelector(".carousel");
    if (!carousel) return;
    carousel.addEventListener("scroll", handleScroll, { passive: true });
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, []);

  function handleScroll(scrollEvent: Event) {
    const carouselElement = scrollEvent?.target as Element;
    const scrolled =
      ((carouselElement.scrollLeft / carouselElement.scrollWidth) *
        images.length) /
      (images.length - 1);
    const carouselIndicator = document.querySelector<HTMLElement>(
      ".carousel-indicator"
    );
    if (!carouselIndicator) return;
    carouselIndicator.style.transform = `translateX(${
      (140 - 14) * scrolled
    }px)`;
  }

  function getSelectedImage() {
    const carouselElement = document.querySelector(".carousel");
    if (!carouselElement) return 1;
    const imageWidth = carouselElement.scrollWidth / images.length;
    return Math.round(carouselElement.scrollLeft / imageWidth) + 1;
  }

  function scrollToImage(imageNumber: number) {
    document
      .getElementById(`image-${imageNumber}`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  }

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
    <div className="carousel-container">
      <i
        role="button"
        className="carousel-scroller left fas fa-arrow-left"
        onClick={previousImage}
      ></i>
      <div className={`carousel ${className}`}>
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


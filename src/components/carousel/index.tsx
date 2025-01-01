import { CAROUSEL_INDICATOR_FULL_WIDTH } from "@/lib/types";
import { scrollToElement } from "@/lib/util";
import "./carousel.css";
import { useScroll } from "@/hooks/scroll";
import { useRef } from "react";

export default function Carousel({
  className = "",
  images,
  onLoadImage,
}: {
  className?: string;
  images: string[];
  onLoadImage: () => void;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const { scroll: carouselScroll, totalWidth: carouselTotalWidth } =
    useScroll(carouselRef);

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
    <div className="flex flex-wrap items-center justify-center gap-x-3">
      <div ref={carouselRef} className={`carousel scroll-x ${className}`}>
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
      <CarouselArrow left onClick={previousImage} />
      <CarouselIndicator
        scrolledWidth={carouselScroll}
        totalWidth={carouselTotalWidth}
        visibleWidth={carouselTotalWidth / images.length}
      />
      <CarouselArrow right onClick={nextImage} />
    </div>
  );
}

export function CarouselArrow({
  left,
  right,
  className = "",
  onClick,
}: {
  className?: string;
  onClick: () => void | Promise<void>;
} & ({ left: true; right?: never } | { left?: never; right: true })) {
  return (
    <button
      className={`h-16 w-16 rounded-full bg-background-soft p-4 ${className}`}
    >
      <i
        className={`fas fa-arrow-${left ? "left" : "right"} text-4xl font-extrabold text-background hover:animate-ping`}
        onClick={onClick}
      ></i>
    </button>
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
    <div
      className="h-3 overflow-hidden rounded-full bg-primary"
      style={{
        width: CAROUSEL_INDICATOR_FULL_WIDTH,
      }}
    >
      <div
        className="h-3 bg-accent"
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

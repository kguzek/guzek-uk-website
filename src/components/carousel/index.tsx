import { useRef } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { useElementScroll } from "@/lib/hooks/element-scroll";
import { CAROUSEL_INDICATOR_FULL_WIDTH } from "@/lib/types";
import { scrollToElement } from "@/lib/util";
import { cn } from "@/lib/utils";

import "./carousel.css";

import Image from "next/image";

export function ImageGallery({
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
    useElementScroll(carouselRef);

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
    <div className="relative flex flex-wrap items-center justify-center gap-2">
      <CarouselArrow left onClick={previousImage} />
      <div ref={carouselRef} className={cn("carousel scroll-x", className)}>
        {images.map((url, idx) => (
          <Image
            key={idx}
            id={`image-${idx + 1}`}
            alt={`gallery image ${idx + 1}`}
            src={url}
            onLoad={onLoadImage}
            onError={onLoadImage}
            width={1000}
            height={600}
          />
        ))}
      </div>
      <CarouselArrow right onClick={nextImage} />
      <CarouselIndicator
        scrolledWidth={carouselScroll}
        totalWidth={carouselTotalWidth}
        visibleWidth={carouselTotalWidth / images.length}
      />
    </div>
  );
}

export function CarouselArrow({
  onClick,
  isVisible = () => true,
  left,
  right,
}: {
  onClick: () => void | Promise<void>;
  isVisible?: (direction: "left" | "right") => boolean;
} & ({ left: true; right?: never } | { left?: never; right: true })) {
  const visible = isVisible(left ? "left" : "right");
  return (
    <button
      className={cn(
        "group flex h-16 w-16 items-center justify-center rounded-full bg-background-soft p-4 transition-all duration-300 lg:absolute",
        {
          "order-3 lg:left-0 lg:order-1 lg:translate-x-[-50%]": left,
          "order-5 lg:right-0 lg:order-3 lg:translate-x-[50%]": right,
          "visible opacity-100 hover:opacity-100 lg:opacity-75 lg:hover:opacity-95":
            visible,
          "lg:invisible lg:opacity-0": !visible,
        },
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "scale-[175%] text-background transition-transform duration-300",
          {
            "lg:scale-[125%] lg:group-hover:scale-[175%]": visible,
          },
        )}
      >
        {left ? <ArrowLeftIcon /> : right ? <ArrowRightIcon /> : null}
      </div>
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
      className="order-4 h-3 overflow-hidden rounded-full bg-primary"
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

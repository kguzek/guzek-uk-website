"use client";

import { useEmblaScroll } from "@/lib/hooks/embla-scroll";
import { useCarousel } from "@/ui/carousel";
import { Progress } from "@/ui/progress";

export function CarouselProgress() {
  const { api } = useCarousel();
  const progress = useEmblaScroll(api);
  // const percentageScrolled = scrolledWidth / (totalWidth - visibleWidth);
  return <Progress value={progress * 100} className="h-4 w-2/3" disableTransitions />;
}

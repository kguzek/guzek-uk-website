"use client";

import { useEmblaScroll } from "@/lib/hooks/embla-scroll";
import { useCarousel } from "@/ui/carousel";
import { Progress } from "@/ui/progress";

export function CarouselProgress() {
  const { api } = useCarousel();
  const progress = useEmblaScroll(api);
  // TODO: initial width
  return (
    <Progress
      value={progress}
      className="h-4 w-2/3"
      disableTransitions
      steps={api?.slideNodes().length || 1}
    />
  );
}

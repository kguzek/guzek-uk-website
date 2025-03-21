"use client";

import { useEmblaScroll } from "@/lib/hooks/embla-scroll";
import { useCarousel } from "@/ui/carousel";
import { Progress } from "@/ui/progress";

export function CarouselProgress() {
  const { api } = useCarousel();
  const { progress, total } = useEmblaScroll(api);
  return (
    <Progress value={progress} className="h-4 w-2/3" disableTransitions steps={total} />
  );
}

import type { Translation } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { CarouselNext, CarouselPrevious } from "@/ui/carousel";

import { CarouselProgress } from "./carousel-progress";

export function CarouselArrows({
  className,
  data,
  ...props
}: React.ComponentProps<"div"> & { data: Translation }) {
  return (
    <div className={cn("mt-4 flex w-full justify-center gap-4", className)} {...props}>
      <CarouselProgress />
      <CarouselPrevious title={data.liveSeries.tvShow.previousImage} />
      <CarouselNext title={data.liveSeries.tvShow.nextImage} />
    </div>
  );
}

import { getTranslations } from "next-intl/server";

import { cn } from "@/lib/utils";
import { CarouselNext, CarouselPrevious } from "@/ui/carousel";

import { CarouselProgress } from "./carousel-progress";

export async function CarouselArrows({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = await getTranslations();
  return (
    <div className={cn("mt-4 flex w-full justify-center gap-4", className)} {...props}>
      <CarouselProgress />
      <CarouselPrevious title={t("liveSeries.tvShow.previousImage")} />
      <CarouselNext title={t("liveSeries.tvShow.nextImage")} />
    </div>
  );
}

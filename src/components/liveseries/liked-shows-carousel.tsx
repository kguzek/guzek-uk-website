import type { Show as TvMazeShow } from "tvmaze-wrapper-ts";

import type { User } from "@/payload-types";
import { getUserLikedShows } from "@/lib/backend/liveseries";
import { Carousel, CarouselContent, CarouselItem } from "@/ui/carousel";

import { CarouselArrows } from "../carousel/carousel-arrows";
import { TvShowPreview } from "./tv-show-preview";

export function LikedShowsCarousel({
  likedShows,
  user,
}: {
  likedShows: { [id: number]: TvMazeShow };
  user: User | null;
}) {
  return (
    <Carousel>
      <CarouselContent>
        {getUserLikedShows(user).map((showId, idx) => (
          <CarouselItem
            className="grid w-full place-items-center"
            key={`home-preview-${showId}-${idx}`}
          >
            <TvShowPreview idx={idx} tvShow={likedShows[showId]} user={user} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselArrows />
    </Carousel>
  );
}

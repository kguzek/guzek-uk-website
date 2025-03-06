import type { Show as TvMazeShow } from "tvmaze-wrapper-ts";

import type { Language } from "@/lib/enums";
import type { User } from "@/payload-types";
import { getUserLikedShows } from "@/lib/backend/liveseries";
import { TRANSLATIONS } from "@/lib/translations";
import { Carousel, CarouselContent, CarouselItem } from "@/ui/carousel";

import { CarouselArrows } from "../carousel/carousel-arrows";
import { TvShowPreview } from "./tv-show-preview";

export function LikedShowsCarousel({
  likedShows,
  userLanguage,
  user,
}: {
  likedShows: { [id: number]: TvMazeShow };
  userLanguage: Language;
  user: User | null;
}) {
  const data = TRANSLATIONS[userLanguage];
  return (
    <Carousel>
      <CarouselContent>
        {getUserLikedShows(user).map((showId, idx) => (
          <CarouselItem
            className="grid w-full place-items-center"
            key={`home-preview-${showId}-${idx}`}
          >
            <TvShowPreview
              idx={idx}
              tvShow={likedShows[showId]}
              userLanguage={userLanguage}
              user={user}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselArrows data={data} />
    </Carousel>
  );
}

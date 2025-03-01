"use client";

import type { MouseEvent } from "react";
import type { Show as TvMazeShow } from "tvmaze-wrapper-ts";
import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { HeartIcon } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { User } from "@/payload-types";
import { fetchFromApi } from "@/lib/backend";
import { getUserLikedShows } from "@/lib/backend/liveseries";
import { TRANSLATIONS } from "@/lib/translations";
import { addOrRemove } from "@/lib/util";
import { cn } from "@/lib/utils";

import { showErrorToast, showFetchErrorToast } from "../error/toast";
import { Tile } from "../tile";
import { TvShowPreviewSkeleton } from "./tv-show-preview-skeleton";

export function TvShowPreview({
  idx,
  tvShow,
  userLanguage,
  user,
}: {
  idx: number;
  tvShow: TvMazeShow;
  userLanguage: Language;
  user: User | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [likedShowIds, setLikedShowIds] = useState(getUserLikedShows(user));
  const [likedShowIdsOptimistic, setLikedShowIdsOptimistic] = useOptimistic(likedShowIds);
  const isLikedOptimistic = likedShowIdsOptimistic.includes(tvShow.id);
  const data = TRANSLATIONS[userLanguage];

  function handleHeart(event_: MouseEvent) {
    if (tvShow == null || user == null) {
      showErrorToast(data.liveSeries.home.login);
      return;
    }
    event_.stopPropagation();

    const newLikedShowIds = addOrRemove(likedShowIds, tvShow.id, !isLikedOptimistic);

    startTransition(async () => {
      setLikedShowIdsOptimistic(newLikedShowIds);

      try {
        await fetchFromApi(`users/${user.id}`, {
          method: "PATCH",
          body: {
            userShows: {
              ...user.userShows,
              liked: newLikedShowIds,
            },
          },
        });
      } catch (error) {
        showFetchErrorToast(data, error);
        return;
      }
      setLikedShowIds(newLikedShowIds);
    });
  }

  if (!tvShow) return <TvShowPreviewSkeleton idx={idx} />;

  // const useIdNotPermalink = `${showDetails?.permalink}` === `${+showDetails?.permalink}`;
  // const link = `/liveseries/tv-show/${useIdNotPermalink ? showDetails.id : showDetails?.permalink}`;
  const link = `/liveseries/tv-show/${tvShow.id}`;

  return (
    <Tile glow containerClassName="w-[240px] pb-10 pt-3 h-full" className="w-full p-0">
      <div className="flex w-full justify-between gap-1 px-4 py-2">
        <Link href={link} title={tvShow?.name} className="overflow-hidden">
          <p className="cutoff text-primary">
            {tvShow?.name} {tvShow.network?.country && `(${tvShow.network.country.code})`}
          </p>
        </Link>

        <button
          onClick={handleHeart}
          className={cn(
            "text-primary hover:text-error glow:text-error transition-colors duration-300",
            {
              "text-error": isLikedOptimistic,
            },
          )}
          disabled={isPending}
          title={data.liveSeries.tvShow[isLikedOptimistic ? "unlike" : "like"]}
        >
          <HeartIcon fill={isLikedOptimistic ? "currentColor" : "none"} />
        </button>
      </div>
      <Link href={link} title={tvShow?.name} className="w-full">
        {tvShow.image?.medium ? (
          <Image
            className="text-primary block h-[300px] w-full bg-cover bg-center object-cover italic"
            src={tvShow.image?.medium}
            alt={tvShow.name + " thumbnail"}
            width={240}
            height={600}
          />
        ) : (
          tvShow.name
        )}
      </Link>
    </Tile>
  );
}

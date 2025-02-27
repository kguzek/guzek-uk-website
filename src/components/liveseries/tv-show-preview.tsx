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
import { TRANSLATIONS } from "@/lib/translations";
import { cn } from "@/lib/utils";

import { showFetchErrorToast } from "../error/toast";
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
  const [likedShowIds, setLikedShowIds] = useState(user?.userShows?.liked ?? []);
  const [likedShowIdsOptimistic, setLikedShowIdsOptimistic] = useOptimistic(likedShowIds);
  const isLikedOptimistic = likedShowIdsOptimistic.includes(tvShow.id);
  const data = TRANSLATIONS[userLanguage];

  function handleHeart(event_: MouseEvent) {
    if (tvShow == null || user == null) return;
    event_.stopPropagation();

    const newLikedShowIds = isLikedOptimistic
      ? user.userShows.liked.filter((id) => id !== tvShow.id)
      : [...user.userShows.liked, tvShow.id];

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
    <div className="bg-background-strong shadow-background-strong outline-background hover:outline-background-soft w-[240px] rounded-md pb-10 outline transition-all duration-300 hover:z-1 hover:-translate-y-2 hover:drop-shadow-2xl">
      <div className="flex w-full justify-between gap-1 px-4 py-2">
        <Link href={link} title={tvShow?.name} className="overflow-hidden">
          <p className="cutoff text-primary">
            {tvShow?.name} ({tvShow.network?.country.code})
          </p>
        </Link>

        <button
          onClick={handleHeart}
          className={cn("text-primary hover:text-error transition-colors duration-300", {
            "text-error": isLikedOptimistic,
          })}
          disabled={isPending}
          title={data.liveSeries.tvShow[isLikedOptimistic ? "unlike" : "like"]}
        >
          <HeartIcon fill={isLikedOptimistic ? "currentColor" : "none"} />
        </button>
      </div>
      <Link href={link} title={tvShow?.name}>
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
    </div>
  );
}

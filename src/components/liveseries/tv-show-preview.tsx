"use client";

import type { MouseEvent } from "react";
import type { Show as TvMazeShow } from "tvmaze-wrapper-ts";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HeartIcon } from "lucide-react";

import type { Language } from "@/lib/enums";
import { clientToApi } from "@/lib/backend/client";
import { useModals } from "@/lib/context/modal-context";
import { TRANSLATIONS } from "@/lib/translations";
import { cn } from "@/lib/utils";

import { TvShowPreviewSkeleton } from "./tv-show-preview-skeleton";

export function TvShowPreview({
  idx,
  tvShow,
  userLanguage,
  isLiked: isLikedInitial,
  accessToken,
}: {
  idx: number;
  tvShow: TvMazeShow;
  userLanguage: Language;
  isLiked: boolean;
  accessToken: string | null;
}) {
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const { setModalError } = useModals();
  const data = TRANSLATIONS[userLanguage];

  async function handleHeart(clickEvent: MouseEvent) {
    if (!tvShow) return;
    if (!accessToken) {
      setModalError(data.liveSeries.home.login);
      return;
    }
    clickEvent.stopPropagation();

    setIsLiked((old) => !old);

    const result = await clientToApi(
      "liveseries/shows/personal/liked/" + tvShow.id,
      accessToken,
      {
        method: isLiked ? "DELETE" : "POST",
        userLanguage,
        setModalError,
      },
    );
    if (!result.ok) {
      setIsLiked(isLiked);
    }
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
            "text-error": isLiked,
          })}
          title={data.liveSeries.tvShow[isLiked ? "unlike" : "like"]}
        >
          <HeartIcon fill={isLiked ? "currentColor" : "none"} />
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

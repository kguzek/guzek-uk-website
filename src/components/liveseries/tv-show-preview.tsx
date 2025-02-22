"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HeartIcon } from "lucide-react";

import type { Language } from "@/lib/enums";
import type { TvShowDetailsShort } from "@/lib/types";
import { clientToApi } from "@/lib/backend/client";
import { useModals } from "@/lib/context/modal-context";
import { TRANSLATIONS } from "@/lib/translations";
import { cn } from "@/lib/utils";

import { TvShowPreviewSkeleton } from "./tv-show-preview-skeleton";

export function TvShowPreview({
  idx,
  showDetails,
  userLanguage,
  isLiked: isLikedInitial,
  accessToken,
}: {
  idx: number;
  showDetails?: TvShowDetailsShort;
  userLanguage: Language;
  isLiked: boolean;
  accessToken: string | null;
}) {
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const { setModalError } = useModals();
  const data = TRANSLATIONS[userLanguage];

  async function handleHeart(clickEvent: MouseEvent) {
    if (!showDetails) return;
    if (!accessToken) {
      setModalError(data.liveSeries.home.login);
      return;
    }
    clickEvent.stopPropagation();

    setIsLiked((old) => !old);

    const result = await clientToApi(
      "liveseries/shows/personal/liked/" + showDetails.id,
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

  if (!showDetails) return <TvShowPreviewSkeleton idx={idx} />;

  const useIdNotPermalink =
    `${showDetails?.permalink}` === `${+showDetails?.permalink}`;
  const link = `/liveseries/tv-show/${
    useIdNotPermalink ? showDetails.id : showDetails?.permalink
  }`;

  return (
    <div className="bg-background-strong shadow-background-strong outline-background hover:outline-background-soft w-[240px] rounded-md pb-10 outline transition-all duration-300 hover:z-1 hover:-translate-y-2 hover:drop-shadow-2xl">
      <div className="flex w-full justify-between gap-1 px-4 py-2">
        <Link href={link} title={showDetails?.name} className="overflow-hidden">
          <p className="cutoff text-primary">
            {showDetails?.name} ({showDetails?.country})
          </p>
        </Link>

        <button
          onClick={handleHeart}
          className={cn(
            "text-primary hover:text-error transition-colors duration-300",
            { "text-error": isLiked },
          )}
          title={data.liveSeries.tvShow[isLiked ? "unlike" : "like"]}
        >
          <HeartIcon fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>
      <Link href={link} title={showDetails?.name}>
        <Image
          className="text-primary block h-[300px] w-full bg-cover bg-center object-cover italic"
          src={showDetails?.image_thumbnail_path}
          alt={showDetails?.name + " thumbnail"}
          width={240}
          height={600}
        />
      </Link>
    </div>
  );
}

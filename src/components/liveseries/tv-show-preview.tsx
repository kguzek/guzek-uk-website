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
    <>
      <div className="w-[240px] rounded-md bg-background pb-10">
        <div className="flex w-full justify-between gap-1 px-4 py-2">
          <Link
            href={link}
            title={showDetails?.name}
            className="overflow-hidden"
          >
            <p className="title cutoff font-serif text-primary-strong">
              {showDetails?.name} ({showDetails?.country})
            </p>
          </Link>
          <button
            onClick={handleHeart}
            className="clickable text-primary"
            title={data.liveSeries.tvShow[isLiked ? "unlike" : "like"]}
          >
            <HeartIcon fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>
        <Link href={link} title={showDetails?.name}>
          <Image
            className="block h-[300px] w-full bg-cover bg-center object-cover"
            src={showDetails?.image_thumbnail_path}
            alt={showDetails?.name + " thumbnail"}
            width={240}
            height={600}
          />
        </Link>
      </div>
    </>
  );
}

"use client";

import { MouseEvent, useState } from "react";
import Link from "next/link";
import { TvShowDetailsShort } from "@/lib/types";
import type { Language } from "@/lib/enums";
import { TRANSLATIONS } from "@/lib/translations";
import { clientToApi } from "@/lib/backend/client";
import { useModals } from "@/context/modal-context";
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
      <div className="w-[240px] rounded-md bg-primary pb-10">
        <div className="flex w-full justify-between px-4 py-2">
          <Link href={link} title={showDetails?.name} className="no-overflow">
            <p className="title serif cutoff text-background visited:text-background-soft">
              {showDetails?.name} ({showDetails?.country})
            </p>
          </Link>
          <div
            onClick={handleHeart}
            title={data.liveSeries.tvShow[isLiked ? "unlike" : "like"]}
          >
            <i
              className={`clickable text-background fa-${
                isLiked ? "solid" : "regular"
              } fa-heart`}
            ></i>
          </div>
        </div>
        <Link href={link} title={showDetails?.name}>
          <img
            className="block h-[300px] w-full bg-cover bg-center object-cover"
            src={showDetails?.image_thumbnail_path}
            alt={showDetails?.name + " thumbnail"}
          />
        </Link>
      </div>
    </>
  );
}

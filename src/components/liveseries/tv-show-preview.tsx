"use client";

import React, { MouseEvent, useState } from "react";
import Link from "next/link";
import { TvShowDetailsShort } from "@/lib/types";
import TvShowPreviewSkeleton from "./tv-show-preview-skeleton";
import { useTranslations } from "@/context/translation-context";
import { useFetch } from "@/context/fetch-context";
import { useLiveSeries } from "@/context/liveseries-context";

export function TvShowPreview({
  idx,
  showDetails,
}: {
  idx: number;
  showDetails?: TvShowDetailsShort;
}) {
  const [flipped, setFlipped] = useState(false);
  const { data } = useTranslations();
  const { removeOldCaches } = useFetch();
  const { userShows, fetchResource } = useLiveSeries();

  const isLikedOld =
    showDetails && userShows?.likedShows
      ? userShows.likedShows.includes(showDetails.id)
      : false;
  const isLiked = flipped ? !isLikedOld : isLikedOld;

  async function handleHeart(clickEvent: MouseEvent) {
    if (!showDetails) return;
    clickEvent.stopPropagation();

    setFlipped(!flipped);

    await fetchResource("shows/personal/liked/" + showDetails.id, {
      method: isLiked ? "DELETE" : "POST",
      onSuccess: () => removeOldCaches(),
      onError: () => setFlipped((old) => !old),
      useEpisodate: false,
    });
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

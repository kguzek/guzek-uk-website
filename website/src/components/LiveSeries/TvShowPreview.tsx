import React, { MouseEvent, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { TvShowDetailsShort } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { OutletContext } from "../../pages/LiveSeries/Base";
import TvShowPreviewSkeleton from "./TvShowPreviewSkeleton";

export default function TvShowPreview({
  idx,
  data,
  showDetails,
  onLoad,
  ready,
}: {
  idx: number;
  data: Translation;
  showDetails?: TvShowDetailsShort;
  ready: boolean;
  onLoad: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const { likedShowIds, reloadSite, fetchResource } =
    useOutletContext<OutletContext>();

  const isLikedOld =
    showDetails && likedShowIds ? likedShowIds.includes(showDetails.id) : false;
  const isLiked = flipped ? !isLikedOld : isLikedOld;

  async function handleHeart(clickEvent: MouseEvent) {
    if (!showDetails) return;
    clickEvent.stopPropagation();

    setFlipped(!flipped);

    await fetchResource("liked-shows/personal/" + showDetails.id, {
      method: isLiked ? "DELETE" : "POST",
      onSuccess: () => reloadSite(),
      onError: () => setFlipped((old) => !old),
      useEpisodate: false,
    });
  }

  if (!showDetails) return <TvShowPreviewSkeleton idx={idx} />;

  return (
    <>
      {!ready && <TvShowPreviewSkeleton idx={idx} />}
      <div className={`preview ${ready ? "" : "display-none"}`}>
        <div className="preview-header flex">
          <Link
            to={`../tv-show/${showDetails?.permalink}`}
            title={showDetails?.name}
            className="no-overflow"
          >
            <p className="title serif cutoff">
              {showDetails?.name} ({showDetails?.country})
            </p>
          </Link>
          <div
            onClick={handleHeart}
            title={data.liveSeries.tvShow[isLiked ? "unlike" : "like"]}
          >
            <i
              className={`clickable fa-${
                isLiked ? "solid" : "regular"
              } fa-heart`}
            ></i>
          </div>
        </div>
        <Link
          to={`../tv-show/${showDetails?.permalink}`}
          title={showDetails?.name}
        >
          <img
            className="thumbnail"
            src={showDetails?.image_thumbnail_path}
            alt={showDetails?.name + " thumbnail"}
            onLoad={onLoad}
            onError={onLoad}
          />
        </Link>
      </div>
    </>
  );
}


import React, { MouseEvent, useContext, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { TvShowDetailsShort } from "../../misc/models";
import { TranslationContext, useFetchContext } from "../../misc/context";
import { LiveSeriesOutletContext } from "../../pages/LiveSeries/Base";
import TvShowPreviewSkeleton from "./TvShowPreviewSkeleton";

export default function TvShowPreview({
  idx,
  showDetails,
  onLoad,
  ready,
}: {
  idx: number;
  showDetails?: TvShowDetailsShort;
  ready: boolean;
  onLoad: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const data = useContext(TranslationContext);
  const { userShows, fetchResource } =
    useOutletContext<LiveSeriesOutletContext>();
  const { removeOldCaches } = useFetchContext();

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
      {!ready && <TvShowPreviewSkeleton idx={idx} />}
      <div className={`preview ${ready ? "" : "display-none"}`}>
        <div className="preview-header flex">
          <Link to={link} title={showDetails?.name} className="no-overflow">
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
        <Link to={link} title={showDetails?.name}>
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

import React, { MouseEvent, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { TvShowDetailsShort } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { OutletContext } from "../../pages/LiveSeries/Base";

export default function TvShowPreview({
  data,
  showDetails,
}: {
  data: Translation;
  showDetails: TvShowDetailsShort;
}) {
  const [flipped, setFlipped] = useState(false);
  const { likedShows, reloadSite, fetchResource } =
    useOutletContext<OutletContext>();

  const isLikedOld = likedShows?.includes(showDetails.id) ?? false;
  const isLiked = flipped ? !isLikedOld : isLikedOld;

  async function handleHeart(clickEvent: MouseEvent) {
    clickEvent.stopPropagation();

    setFlipped(!flipped);

    await fetchResource("liked/personal/" + showDetails.id, {
      method: isLiked ? "DELETE" : "POST",
      onSuccess: () => reloadSite(),
      useEpisodate: false,
    });
  }

  return (
    <div className="preview">
      <div className="preview-header flex">
        <Link
          to={`../tv-show/${showDetails.permalink}`}
          title={showDetails.name}
        >
          <p className="title serif cutoff">
            {showDetails.name} ({showDetails.country})
          </p>
        </Link>
        <i
          className={`fa-${isLiked ? "solid" : "regular"} fa-heart`}
          title={data.liveSeries.tvShow[isLiked ? "unlike" : "like"]}
          onClick={handleHeart}
        ></i>
      </div>
      <Link to={`../tv-show/${showDetails.permalink}`} title={showDetails.name}>
        <div
          className="thumbnail"
          style={{
            backgroundImage: `url("${showDetails.image_thumbnail_path}")`,
          }}
        />
      </Link>
    </div>
  );
}


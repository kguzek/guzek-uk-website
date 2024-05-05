import React from "react";
import { Link } from "react-router-dom";
import { TvShowDetailsShort } from "../../misc/models";
import { Translation } from "../../misc/translations";

export default function TvShowPreview({
  data,
  showDetails,
}: {
  data: Translation;
  showDetails: TvShowDetailsShort;
}) {
  return (
    <Link
      to={`../tv-show/${showDetails.permalink}`}
      title={showDetails.name}
      className="preview"
    >
      <p className="title serif cutoff">{showDetails.name}</p>
      <div
        className="thumbnail"
        style={{
          backgroundImage: `url("${showDetails.image_thumbnail_path}")`,
        }}
      />
    </Link>
  );
}


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
  function formatDate(which: "start" | "end") {
    const dateString = showDetails[`${which}_date`];
    if (!dateString)
      return data.liveSeries.tvShow[
        which === "end" && showDetails.status === "Running"
          ? "present"
          : "unknown"
      ];
    const date = new Date(dateString);
    if (date.toString() === "Invalid Date") return dateString;
    return date.toLocaleDateString();
  }

  return (
    <Link
      to={`../tv-show/${showDetails.id}`}
      title={showDetails.name}
      className="preview"
    >
      <p className="title serif nowrap">{showDetails.name}</p>
      <div
        className="thumbnail"
        style={{
          backgroundImage: `url("${showDetails.image_thumbnail_path}")`,
        }}
      />
    </Link>
  );
}


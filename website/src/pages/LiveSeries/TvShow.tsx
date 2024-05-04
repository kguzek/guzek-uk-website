import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen";
import { fetchFromEpisodate } from "../../misc/episodate";
import { ErrorCode, TvShowDetails } from "../../misc/models";
import { Translation } from "../../misc/translations";
import { setTitle } from "../../misc/util";
import ErrorPage from "../ErrorPage";
import { getLiveSeriesTitle } from "./Base";

export default function TvShow({ data }: { data: Translation }) {
  const [loading, setLoading] = useState(false);
  const [tvShowDetails, setTvShowDetails] = useState<null | TvShowDetails>(
    null
  );
  const { tvShowId } = useParams();

  useEffect(() => {
    console.log(tvShowId);
    if (loading || !tvShowId) return;

    fetchShow(tvShowId);
  }, [tvShowId]);

  useEffect(() => {
    setTitle(getLiveSeriesTitle(data, "tvShow"));
  }, [data]);

  async function fetchShow(tvShowId: string) {
    setLoading(true);
    try {
      const res = await fetchFromEpisodate("show-details", { q: tvShowId });
      const json = await res.json();
      setLoading(false);
      if (res.ok) {
        setTvShowDetails(json.tvShow);
      } else {
        console.error("Received bad response");
      }
    } catch {
      setLoading(false);
    }
  }

  if (loading) return <LoadingScreen text={data.loading} />;

  return tvShowDetails ? (
    <div className="details">
      <h3>{tvShowDetails.name}</h3>
      <blockquote>{tvShowDetails.description}</blockquote>
      <small>
        From{" "}
        <a href={tvShowDetails.description_source}>
          {tvShowDetails.description_source}
        </a>
      </small>
      <div className="images">
        {tvShowDetails.pictures.map((url, idx) => (
          <img key={idx} alt={`image-${idx + 1}`} src={url} />
        ))}
      </div>
    </div>
  ) : (
    <ErrorPage data={data} errorCode={ErrorCode.NotFound} />
  );
}


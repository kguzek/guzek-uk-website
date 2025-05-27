import type { Metadata } from "next";
import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import { getTranslations } from "next-intl/server";
import { findShowById, getShowEpisodes } from "tvmaze-wrapper-ts";

import { ErrorComponent } from "@/components/error/component";
import { EpisodesList } from "@/components/liveseries/episodes-list";
import { OG_IMAGE_METADATA } from "@/lib/constants";
import { ErrorCode } from "@/lib/enums";
import { convertHtmlToPlainText } from "@/lib/lexical";
import { getAuth } from "@/lib/providers/auth-provider";
import { isNumber } from "@/lib/util";

import { ShowDetails } from "./show-details";
import { WatchedIndicator } from "./watched-indicator";

interface ShowDetailsProps {
  params: Promise<Record<string, string>>;
}

const isTvShow = (tvShow: unknown) =>
  typeof tvShow === "object" && tvShow != null && "id" in tvShow && "summary" in tvShow;

export async function generateMetadata(props: ShowDetailsProps): Promise<Metadata> {
  const t = await getTranslations();
  const show = await getShowDetails(props);
  if (!show) {
    return {
      title: t("liveSeries.tvShow.showDetails"),
    };
  }
  return {
    title: show.name || t("liveSeries.tvShow.showDetails"),
    description: show.summary ? convertHtmlToPlainText(show.summary) : undefined,
    keywords: [
      show.name,
      ...show.genres,
      "LiveSeries",
      "TV Show",
      "watch",
      "stream",
      "summary",
      "episodes",
      "seasons",
    ],
    openGraph: {
      images: {
        url: show.image?.original ?? "/api/og-image/liveseries",
        ...OG_IMAGE_METADATA,
      },
    },
  };
}

function sortEpisodes(episodes: TvMazeEpisode[]) {
  const seasons: { [season: number]: TvMazeEpisode[] } = {};
  for (const episode of episodes) {
    const season = episode.season;
    if (seasons[season]) {
      seasons[season].push(episode);
    } else {
      seasons[season] = [episode];
    }
  }
  return Object.entries(seasons) as [`${number}`, TvMazeEpisode[]][];
}

async function getShowDetails({ params }: ShowDetailsProps) {
  const { permalink } = await params;
  if (!isNumber(permalink)) {
    // console.warn("Invalid tv show permalink:", permalink);
    return null;
  }
  const tvShow = await findShowById(permalink);
  if (!isTvShow(tvShow)) {
    console.warn("Invalid tv show details:", tvShow);
    return null;
  }
  return tvShow;
}

export default async function TvShow(props: ShowDetailsProps) {
  const t = await getTranslations();
  const { user } = await getAuth();
  const tvShow = await getShowDetails(props);
  if (tvShow == null) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }

  const result = await getShowEpisodes(tvShow.id);
  const episodes = Array.isArray(result) ? result : [];
  // Some legit shows have no episodes for some reaaso
  // if (episodes.length === 0) {
  //   console.warn("No episodes found for tv show:", tvShow.name, result);
  // }

  return (
    <ShowDetails tvShow={tvShow} episodes={episodes} user={user}>
      {sortEpisodes(episodes).map(([season, episodes]) => (
        <EpisodesList
          key={`season-${season}`}
          tvShow={tvShow}
          heading={`${t("liveSeries.tvShow.season")} ${season}`}
          episodes={episodes}
        >
          <WatchedIndicator season={season} episodes={episodes} />
        </EpisodesList>
      ))}
    </ShowDetails>
  );
}

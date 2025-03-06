import type { Metadata } from "next";
import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import { findShowById, getShowEpisodes } from "tvmaze-wrapper-ts";

import { ErrorComponent } from "@/components/error/component";
import { EpisodesList } from "@/components/liveseries/episodes-list";
import { ErrorCode } from "@/lib/enums";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { isNumber } from "@/lib/util";

import { ShowDetails } from "./show-details";
import { WatchedIndicator } from "./watched-indicator";

interface Props {
  params: Promise<Record<string, string>>;
}

const isTvShow = (tvShow: unknown) =>
  typeof tvShow === "object" && tvShow != null && "id" in tvShow && "summary" in tvShow;

export async function generateMetadata({ params }: Props) {
  const { data } = await getTranslations();
  const show = await getShowDetails(params);
  return {
    title: show?.name || data.liveSeries.tvShow.showDetails,
  } satisfies Metadata;
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

async function getShowDetails(params: Props["params"]) {
  const { permalink } = await params;
  if (!isNumber(permalink)) {
    console.warn("Invalid tv show permalink:", permalink);
    return null;
  }
  const tvShow = await findShowById(permalink);
  if (!isTvShow(tvShow)) {
    console.warn("Invalid tv show details:", tvShow);
    return null;
  }
  return tvShow;
}

export default async function TvShow({ params }: Props) {
  const { data, userLanguage } = await getTranslations();
  const { user } = await getAuth();
  const tvShow = await getShowDetails(params);
  if (tvShow == null) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }

  const result = await getShowEpisodes(tvShow.id);
  const episodes = Array.isArray(result) ? result : [];
  if (episodes.length === 0) {
    console.warn("No episodes found for tv show:", tvShow.name, result);
  }

  return (
    <ShowDetails
      tvShow={tvShow}
      episodes={episodes}
      user={user}
      userLanguage={userLanguage}
    >
      {sortEpisodes(episodes).map(([season, episodes]) => (
        <EpisodesList
          key={`season-${season}`}
          tvShow={tvShow}
          heading={`${data.liveSeries.tvShow.season} ${season}`}
          episodes={episodes}
        >
          <WatchedIndicator
            season={season}
            episodes={episodes}
            userLanguage={userLanguage}
          />
        </EpisodesList>
      ))}
    </ShowDetails>
  );
}

import type { Episode as TvMazeEpisode } from "tvmaze-wrapper-ts";
import { findShowById, getShowEpisodes } from "tvmaze-wrapper-ts";

import { ErrorComponent } from "@/components/error/component";
import { EpisodesList } from "@/components/liveseries/episodes-list";
import { ErrorCode } from "@/lib/enums";
import { getAuth } from "@/lib/providers/auth-provider/rsc";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle, isNumber } from "@/lib/util";

import { ShowDetails } from "./show-details";
import { WatchedIndicator } from "./watched-indicator";

interface Props {
  params: Promise<Record<string, string>>;
}

export async function generateMetadata({ params }: Props) {
  const { data } = await getTranslations();
  const show = await getShowDetails(params);
  return {
    title: getTitle(
      show?.name || data.liveSeries.tvShow.showDetails,
      data.liveSeries.title,
    ),
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
  return Object.entries(seasons);
}

async function getShowDetails(params: Props["params"]) {
  const { permalink } = await params;
  if (!isNumber(permalink)) {
    console.warn("Invalid tv show permalink:", permalink);
    return null;
  }
  const tvShow = await findShowById(permalink);
  if (tvShow?.name == null) {
    console.warn("Invalid tv show details:", tvShow);
    return null;
  }
  return tvShow;
}

export default async function TvShow({ params }: Props) {
  const { data, userLanguage } = await getTranslations();
  const { user, accessToken } = await getAuth();
  const tvShow = await getShowDetails(params);
  if (tvShow == null) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }
  const liked = user?.userShows?.liked?.includes(tvShow.id) ?? false;
  const subscribed = user?.userShows?.subscribed?.includes(tvShow.id) ?? false;
  const watchedEpisodes = user?.watchedEpisodes ?? {};

  const episodes = await getShowEpisodes(tvShow.id);

  return (
    <ShowDetails
      tvShow={tvShow}
      episodes={episodes}
      liked={liked ?? false}
      subscribed={subscribed ?? false}
      user={user}
      userLanguage={userLanguage}
      watchedEpisodes={watchedEpisodes[tvShow.id] ?? {}}
      accessToken={accessToken}
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

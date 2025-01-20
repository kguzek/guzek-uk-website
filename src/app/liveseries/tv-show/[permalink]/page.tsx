import { ErrorComponent } from "@/components/error-component";
import { getAccessToken, serverToApi } from "@/lib/backend/server";
import { ErrorCode } from "@/lib/enums";
import {
  Episode,
  ShowData,
  UserShows,
  WatchedEpisodes,
  type TvShowDetails,
} from "@/lib/types";
import { getTitle } from "@/lib/util";
import { getCurrentUser } from "@/lib/backend/user";
import { useTranslations } from "@/providers/translation-provider";
import { ShowDetails } from "./show";
import { EpisodesList } from "@/components/liveseries/episodes-list";
import { WatchedIndicator } from "./watched-indicator";

interface Props {
  params: Promise<Record<string, string>>;
}

export async function generateMetadata({ params }: Props) {
  const { data } = await useTranslations();
  const result = await getShowDetails(params);
  return {
    title: getTitle(
      (result.ok && result.data.tvShow.name) ||
        data.liveSeries.tvShow.showDetails,
      data.liveSeries.title,
    ),
  };
}

function sortEpisodes(episodes: Episode[]) {
  const seasons: { [season: number]: Episode[] } = {};
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
  const result = await serverToApi<{ tvShow: TvShowDetails }>("show-details", {
    params: { q: (await params).permalink },
    api: "episodate",
  });
  if (!result.ok) return result;
  if (result.data?.tvShow?.name == null) {
    console.warn("Invalid tv show details:", result.data);
    return { ok: false } as const;
  }
  return result;
}
export default async function TvShow({ params }: Props) {
  const { permalink } = await params;
  const { data, userLanguage } = await useTranslations();
  const showResult = await serverToApi<{ tvShow: TvShowDetails }>(
    "show-details",
    {
      params: { q: permalink },
      api: "episodate",
    },
  );
  if (!showResult.ok) {
    return <ErrorComponent errorCode={ErrorCode.NotFound} />;
  }
  const showsResult = await serverToApi<UserShows>("liveseries/shows/personal");
  const liked =
    showsResult.ok &&
    showsResult.data.likedShows?.includes(showResult.data.tvShow.id);
  const subscribed =
    showsResult.ok &&
    showsResult.data.subscribedShows?.includes(showResult.data.tvShow.id);
  const watchedEpisodesResult = await serverToApi<ShowData<WatchedEpisodes>>(
    "liveseries/watched-episodes/personal",
  );
  const watchedEpisodes =
    (watchedEpisodesResult.ok &&
      watchedEpisodesResult.data[showResult.data.tvShow.id]) ||
    [];
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();

  return (
    <ShowDetails
      tvShowDetails={showResult.data.tvShow}
      liked={liked ?? false}
      subscribed={subscribed ?? false}
      user={user}
      userLanguage={userLanguage}
      watchedEpisodes={watchedEpisodes}
      accessToken={accessToken}
    >
      {sortEpisodes(showResult.data.tvShow.episodes).map(
        ([season, episodes]) => (
          <EpisodesList
            key={`season-${season}`}
            tvShow={showResult.data.tvShow}
            heading={`${data.liveSeries.tvShow.season} ${season}`}
            episodes={episodes}
          >
            <WatchedIndicator
              season={season}
              episodes={episodes}
              userLanguage={userLanguage}
            />
          </EpisodesList>
        ),
      )}
    </ShowDetails>
  );
}
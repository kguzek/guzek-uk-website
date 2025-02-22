import type { ReactNode } from "react";
import { ChevronRightIcon, ClockIcon } from "lucide-react";

import type {
  Episode as EpisodeType,
  ShowData,
  TvShowDetails,
  WatchedEpisodes,
} from "@/lib/types";
import { serverToApi } from "@/lib/backend/server";
import { getAuth } from "@/lib/providers/auth-provider";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getEpisodeAirDate, hasEpisodeAired } from "@/lib/util";

import { EpisodeDownloadIndicator } from "./episode-download-indicator";
import { EpisodeWatchedIndicator } from "./episode-watched-indicator";

async function Episode({
  episode,
  tvShow,
  watchedEpisodes,
}: {
  episode: EpisodeType;
  tvShow: TvShowDetails;
  watchedEpisodes: ShowData<WatchedEpisodes> | null;
}) {
  const { data, userLanguage } = await getTranslations();
  const { user, accessToken } = await getAuth();

  const airDate = data.dateTimeFormat.format(getEpisodeAirDate(episode));

  const watchedInSeason = watchedEpisodes?.[tvShow.id]?.[+episode.season];

  return (
    <div className="bg-background-soft box-border flex w-full flex-col items-center gap-2 rounded-lg p-2 px-4 sm:flex-row sm:justify-between">
      <div className="w-full self-start overflow-hidden">
        <div className="grid grid-cols-[auto_1fr] gap-2" title={episode.name}>
          <i>{data.liveSeries.episodes.serialise(episode)}</i>
          <div className="cutoff text-accent-soft w-full">{episode.name}</div>
        </div>
        <small>{airDate}</small>
      </div>
      <div className="flex items-center gap-4">
        {hasEpisodeAired(episode) ? (
          <>
            <EpisodeDownloadIndicator
              user={user}
              userLanguage={userLanguage}
              accessToken={accessToken}
              episode={episode}
              tvShow={tvShow}
            />
            <EpisodeWatchedIndicator
              userLanguage={userLanguage}
              showId={tvShow.id}
              episode={episode}
              watchedInSeason={watchedInSeason ?? []}
              accessToken={accessToken}
            />
          </>
        ) : (
          <ClockIcon className="cursor-not-allowed" />
        )}
      </div>
    </div>
  );
}

export async function EpisodesList({
  tvShow,
  heading,
  episodes,
  children,
}: {
  tvShow: TvShowDetails;
  heading: string;
  episodes: EpisodeType[];
  children?: ReactNode;
}) {
  const { user } = await getAuth();
  let watchedEpisodes: ShowData<WatchedEpisodes> = {};
  if (user != null) {
    const watchedEpisodesResult = await serverToApi<ShowData<WatchedEpisodes>>(
      "liveseries/watched-episodes/personal",
    );
    if (watchedEpisodesResult.ok) {
      watchedEpisodes = watchedEpisodesResult.data;
    }
  }
  return (
    <div>
      <div className="peer flex items-center gap-4">
        <label className="clickable flex items-center gap-4">
          <input type="checkbox" className="peer hidden" />
          <ChevronRightIcon className="transition-transform duration-300 peer-checked:rotate-90"></ChevronRightIcon>
          <h4 className="my-4 text-lg font-bold">{heading}</h4>
        </label>
        {children}
      </div>
      <div className="collapsible collapsed peer-has-[:checked]:expanded">
        <div className="episodes grid gap-3 overflow-hidden md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {episodes.map((episode, idx) => (
            <Episode
              key={`episode-unwatched-${idx}`}
              episode={episode}
              tvShow={tvShow}
              watchedEpisodes={watchedEpisodes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

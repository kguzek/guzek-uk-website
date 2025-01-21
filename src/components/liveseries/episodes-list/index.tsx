import { ReactNode } from "react";
import type {
  Episode as EpisodeType,
  TvShowDetails,
  WatchedEpisodes,
  ShowData,
} from "@/lib/types";
import { getEpisodeAirDate, hasEpisodeAired } from "@/lib/util";
import { useTranslations } from "@/providers/translation-provider";
import { EpisodeWatchedIndicator } from "./episode-watched-indicator";
import { getAccessToken, serverToApi } from "@/lib/backend/server";
import { EpisodeDownloadIndicator } from "./episode-download-indicator";
import { getCurrentUser } from "@/lib/backend/user";

async function Episode({
  episode,
  tvShow,
  watchedEpisodes,
}: {
  episode: EpisodeType;
  tvShow: TvShowDetails;
  watchedEpisodes: ShowData<WatchedEpisodes> | null;
}) {
  const { data, userLanguage } = await useTranslations();
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();

  if (!accessToken || !user) {
    // TODO: handle this case
    return null;
  }

  const airDate = data.dateTimeFormat.format(getEpisodeAirDate(episode));

  const watchedInSeason = watchedEpisodes?.[tvShow.id]?.[+episode.season];

  return (
    <div className="box-border flex w-full gap-2 rounded-lg bg-background-soft p-2 px-4">
      <div className="mr-auto overflow-hidden">
        <div className="flex gap-2" title={episode.name}>
          <i>{data.liveSeries.episodes.serialise(episode)}</i>
          <div className="cutoff text-accent-soft">{episode.name}</div>
        </div>
        <small>{airDate}</small>
      </div>
      <div className="noshrink flex items-center gap-4">
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
          <i className="watched centred fa-regular fa-clock"></i>
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
  const user = await getCurrentUser();
  let watchedEpisodes: ShowData<WatchedEpisodes> = {};
  if (user && user.serverUrl) {
    const [watchedEpisodesResult] = await Promise.all([
      serverToApi<ShowData<WatchedEpisodes>>(
        "liveseries/watched-episodes/personal",
      ),
    ]);
    if (watchedEpisodesResult.ok) {
      watchedEpisodes = watchedEpisodesResult.data;
    }
  }
  return (
    <div>
      <div className="peer flex items-center gap-4">
        <label className="clickable flex items-center gap-4">
          <input type="checkbox" className="peer hidden" />
          <i className="fas fa-caret-right transition-transform peer-checked:rotate-90"></i>
          <h4 className="my-4 text-lg font-bold">{heading}</h4>
        </label>
        {children}
      </div>
      <div className="collapsible collapsed peer-has-[:checked]:expanded">
        <div className="episodes no-overflow grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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

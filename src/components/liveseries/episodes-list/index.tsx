import type { ReactNode } from "react";
import type { Episode as TvMazeEpisode, Show as TvMazeShow } from "tvmaze-wrapper-ts";
import { ChevronRightIcon, ClockIcon } from "lucide-react";
import { getFormatter, getLocale } from "next-intl/server";

import { Tile } from "@/components/tile";
import { getFormatters } from "@/i18n/request";
import { getAuth } from "@/lib/providers/auth-provider";
import { getEpisodeAirDate, hasEpisodeAired } from "@/lib/util";
import { cn } from "@/lib/utils";

import { EpisodeDownloadIndicator } from "./episode-download-indicator";
import { EpisodeWatchedIndicator } from "./episode-watched-indicator";

async function Episode({
  episode,
  tvShow,
}: {
  episode: TvMazeEpisode;
  tvShow: TvMazeShow;
}) {
  const formatter = await getFormatter();
  const locale = await getLocale();
  const formatters = getFormatters(locale);
  const { user, accessToken } = await getAuth();

  const airDate = formatter.dateTime(getEpisodeAirDate(episode), "dateTime");

  return (
    <div className="bg-background box-border flex w-full flex-col items-center gap-2 rounded-lg p-2 px-4 sm:flex-row sm:justify-between">
      <div className="w-full self-start overflow-hidden">
        <div className="grid grid-cols-[auto_1fr] gap-2" title={episode.name}>
          <p>{formatters.serialiseEpisode(episode)}</p>
          <div className="cutoff text-accent-soft w-full">{episode.name}</div>
        </div>
        <small className="text-background-soft">{airDate}</small>
      </div>
      <div className="flex items-center gap-4">
        {hasEpisodeAired(episode) ? (
          <>
            <EpisodeDownloadIndicator
              user={user}
              accessToken={accessToken}
              episode={episode}
              tvShow={tvShow}
            />
            <EpisodeWatchedIndicator showId={tvShow.id} episode={episode} user={user} />
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
  tvShow: TvMazeShow;
  heading: string;
  episodes: TvMazeEpisode[];
  children?: ReactNode;
}) {
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
      <div className="collapsible collapsed peer-has-checked:expanded focus-within:expanded">
        <div className="overflow-hidden">
          <Tile
            containerClassName="w-full"
            className={cn("grid w-full gap-3 xl:gap-x-6 xl:gap-y-4", {
              "xl:grid-cols-2": episodes.length > 1,
            })}
          >
            {episodes.map((episode, idx) => (
              <Episode
                key={`episode-unwatched-${idx}`}
                episode={episode}
                tvShow={tvShow}
              />
            ))}
          </Tile>
        </div>
      </div>
    </div>
  );
}

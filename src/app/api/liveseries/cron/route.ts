import type { NextRequest } from "next/server";
import type { Episode, Show } from "tvmaze-wrapper-ts";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { findShowById, getShowEpisodes } from "tvmaze-wrapper-ts";

import type { User } from "@/payload-types";
import { getFormatters } from "@/i18n/request";
import { fetchFromApi } from "@/lib/backend";
import { HttpError } from "@/lib/backend/error-handling";
import { getUserShows } from "@/lib/backend/liveseries";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { hasEpisodeAired } from "@/lib/util";

const CRON_USER_USERNAME = process.env.CRON_USER_USERNAME;
const CRON_USER_PASSWORD = process.env.CRON_USER_PASSWORD;

const formatters = getFormatters(DEFAULT_LOCALE);

type UserWithServerUrl = User & { serverUrl: string };

/** Returns an error message or null. */
async function downloadEpisode(
  user: UserWithServerUrl,
  accessToken: string,
  showName: string,
  showId: number,
  episode: Episode,
) {
  const serialised = `${showName} ${formatters.serialiseEpisode(episode)}`;
  console.info(`Downloading ${serialised} for user ${user.username}`);
  const body = {
    showName,
    season: episode.season,
    episode: episode.number,
    showId,
  };
  try {
    console.log(body);
    await fetchFromApi("liveseries/downloaded-episodes", {
      method: "POST",
      accessToken,
      urlBase: user.serverUrl,
      body,
    });
  } catch (error) {
    if (error instanceof HttpError && error.response.status === 409) {
      // console.log(`Episode ${showName} ${episode.season}:${episode.number} already downloaded`);
      return null;
    }
    const errorMessage = (error as Error).message;
    console.error(`Failed to download ${serialised}:`, errorMessage);
    return errorMessage;
  }
  console.info(`Successfully downloaded ${serialised}`);
  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const apiToken = request.headers.get("x-api-token");
  if (!apiToken || apiToken !== process.env.CRON_API_TOKEN) {
    return NextResponse.json({ message: "Invalid API token" }, { status: 401 });
  }
  if (!CRON_USER_PASSWORD || !CRON_USER_USERNAME) {
    return NextResponse.json(
      { message: "The CRON user credentials are missing." },
      { status: 500 },
    );
  }
  const payload = await getPayload({ config });
  const users = await payload.find({
    collection: "users",
    where: { serverUrl: { like: "http ://" } },
  });
  let accessToken: string | undefined;
  let error = "Invalid credentials";
  try {
    const data = { username: CRON_USER_USERNAME, password: CRON_USER_PASSWORD };
    const loginResult = await payload.login({
      collection: "users",
      data,
    });
    accessToken = loginResult.token;
  } catch (loginError) {
    if (loginError instanceof Error) {
      error = loginError.message;
      console.error("Failed to log in:", error);
    } else {
      console.error("Unknown login error:", loginError);
    }
  }
  if (!accessToken) {
    return NextResponse.json(
      { message: "Failed to authenticate with CRON user", error },
      { status: 500 },
    );
  }

  return await downloadUnwatchedEpisodes(users.docs, accessToken);
}

/** Downloads each user's unwatched aired episodes using the provided CRON access token. */
async function downloadUnwatchedEpisodes(
  users: User[],
  accessToken: string,
): Promise<NextResponse> {
  const _showInfoCache: Map<number, { episodes: Episode[]; details: Show }> = new Map();

  /** Utilises a temporary in-memory cache so as not to fetch the same show episodes & details multiple times. */
  async function getShowInfo(showId: number) {
    let info = _showInfoCache.get(showId);
    if (info == null) {
      const [episodes, details] = await Promise.all([
        getShowEpisodes(showId),
        findShowById(showId),
      ]);
      info = { episodes, details };
      _showInfoCache.set(showId, info);
    }
    return info;
  }

  /**
   * Traverses the user's subscribed shows and downloads the unwatched episodes of those shows which have aired.
   * @returns an array of episode-error message entries, which can be empty.
   */
  async function downloadUserUnwatchedEpisodes(user: UserWithServerUrl, showId: number) {
    const { episodes, details } = await getShowInfo(showId);
    if (!episodes || !details) {
      const errorMessage = `Failed to fetch episodes for show ID ${showId}`;
      console.warn(errorMessage);
      return errorMessage;
    }
    if (typeof episodes.filter !== "function") {
      console.warn("Invalid episodes:", episodes);
      return `Invalid episodes for ${showId}`;
    }
    const unwatchedAiredEpisodes = episodes.filter(
      (episode) =>
        hasEpisodeAired(episode) &&
        !user.watchedEpisodes[showId]?.[episode.season].includes(episode.number),
    );
    const results = await Promise.all(
      unwatchedAiredEpisodes.map(
        async (episode) =>
          [
            formatters.serialiseEpisode(episode),
            await downloadEpisode(user, accessToken, details.name, showId, episode),
          ] as const,
      ),
    );
    return results.filter((result) => result[1] != null) as [string, string][];
  }

  let checkedUsers = 0;
  let numErrors = 0;

  type LogRecord = Record<string, Record<string, string | Record<string, string>>>;

  const logRecord: LogRecord = {};
  const errorMessages: LogRecord = {};

  for (const user of users) {
    if (!user.serverUrl) {
      console.warn(`User ID ${user.id} has no server URL`);
      continue;
    }
    checkedUsers++;
    const errorMessagesInfo = await Promise.all(
      getUserShows(user, "subscribed").map(async (showId) => {
        const result = await downloadUserUnwatchedEpisodes(
          user as UserWithServerUrl,
          showId,
        );
        if (result.length === 0) {
          return [[], 0] as const;
        }
        if (Array.isArray(result)) {
          return [[[showId, Object.fromEntries(result)]], result.length] as const;
        }
        return [[[showId, result]], 1] as const;
      }),
    );
    const [errorMessageEntries, numErrorsForUser] = errorMessagesInfo.reduce(
      (acc, [errorMessageEntries, numErrorsForUser]) => {
        acc[0].push(...errorMessageEntries);
        acc[1] += numErrorsForUser;
        return acc;
      },
      [[], 0] as [(readonly [number, string | Record<string, string>])[], number],
    );
    if (errorMessageEntries.length > 0) {
      numErrors += numErrorsForUser;
      const ers = Object.fromEntries(errorMessageEntries);
      errorMessages[user.username] = ers;
    }
  }
  return numErrors === 0
    ? NextResponse.json({
        message: "Scheduled task performed successfully.",
        checkedUsers,
        logs: logRecord,
      })
    : NextResponse.json(
        {
          message: `Scheduled task failed with ${numErrors} error${numErrors === 1 ? "" : "s"}`,
          checkedUsers,
          logs: logRecord,
          errorMessages,
        },
        { status: 500 },
      );
}

import type { User } from "@/payload-types";
import { showFetchErrorToast } from "@/components/error/toast";

import type { Language } from "../enums";
import { fetchFromApi } from ".";
import { TRANSLATIONS } from "../translations";

async function tryPatchUser(
  user: User,
  userLanguage: Language,
  body: Record<string, unknown>,
) {
  try {
    await fetchFromApi(`users/${user.id}`, {
      method: "PATCH",
      body,
    });
  } catch (error) {
    showFetchErrorToast(TRANSLATIONS[userLanguage], error);
    return false;
  }
  return true;
}

export const updateUserWatchedEpisodes = async (
  user: User,
  userLanguage: Language,
  showId: number,
  season: number | `${number}`,
  newWatchedEpisodes: number[],
) =>
  tryPatchUser(user, userLanguage, {
    watchedEpisodes: {
      ...user.watchedEpisodes,
      [showId]: {
        ...user.watchedEpisodes[showId],
        [season]: newWatchedEpisodes,
      },
    },
  });

export const updateUserShowLike = (
  user: User,
  userLanguage: Language,
  showId: number,
  isLiked: boolean,
) =>
  tryPatchUser(user, userLanguage, {
    userShows: {
      ...user.userShows,
      liked: isLiked
        ? [...user.userShows.liked, showId]
        : user.userShows.liked.filter((id) => id !== showId),
    },
  });

export const updateUserShowSubscription = (
  user: User,
  userLanguage: Language,
  showId: number,
  isSubscribed: boolean,
) =>
  tryPatchUser(user, userLanguage, {
    userShows: {
      ...user.userShows,
      subscribed: isSubscribed
        ? [...user.userShows.subscribed, showId]
        : user.userShows.subscribed.filter((id) => id !== showId),
    },
  });

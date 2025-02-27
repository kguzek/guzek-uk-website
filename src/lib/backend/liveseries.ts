import type { EpisodeArray, User } from "@/payload-types";
import { showFetchErrorToast } from "@/components/error/toast";

import type { Language } from "../enums";
import { fetchFromApi } from ".";
import { TRANSLATIONS } from "../translations";
import { addOrRemove, ensureUnique } from "../util";

async function tryPatchUser(user: User, userLanguage: Language, body: Partial<User>) {
  let res;
  try {
    res = await fetchFromApi(`users/${user.id}`, {
      method: "PATCH",
      body,
    });
  } catch (error) {
    showFetchErrorToast(TRANSLATIONS[userLanguage], error);
    return false;
  }
  console.debug("Updated user details:", res.data);
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
        [season]: ensureUnique(newWatchedEpisodes),
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
      liked: addOrRemove(user.userShows?.liked, showId, isLiked),
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
      subscribed: addOrRemove(user.userShows?.subscribed, showId, isSubscribed),
    },
  });

export const getUserLikedShows = (user: User | null): EpisodeArray =>
  user?.userShows?.liked?.filter((id) => id > 0) ?? [];

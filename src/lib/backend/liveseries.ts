import type { EpisodeArray, User } from "@/payload-types";
import { showFetchErrorToast } from "@/components/error/toast";

import type { Language } from "../enums";
import { fetchFromApi } from ".";
import { TRANSLATIONS } from "../translations";
import { addOrRemove } from "../util";

// export type UpdatedWatchedEpisodes =
//   | {
//       watchedInSeason: number[];
//       watchedEpisodes?: never;
//     }
//   | {
//       watchedInSeason?: never;
//       watchedEpisodes: WatchedEpisodes;
//     };

export async function tryPatchUser(
  user: User,
  userLanguage: Language,
  body: Partial<User>,
) {
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

export const updateUserShowLike = (
  user: User,
  userLanguage: Language,
  showId: number,
  isLiked: boolean,
) =>
  tryPatchUser(user, userLanguage, {
    userShows: {
      ...user.userShows,
      liked: addOrRemove(user.userShows?.liked, showId, isLiked, true),
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
      subscribed: addOrRemove(user.userShows?.subscribed, showId, isSubscribed, true),
    },
  });

export const getUserLikedShows = (user: User | null): EpisodeArray =>
  user?.userShows?.liked?.filter((id) => id > 0) ?? [];

import { ErrorComponent } from "@/components/error-component";
import { serverToApi } from "@/lib/backend-v2";
import { ErrorCode } from "@/lib/enums";
import {
  ShowData,
  UserShows,
  WatchedEpisodes,
  type TvShowDetails,
} from "@/lib/types";
import { getTitle } from "@/lib/util";
import { getCurrentUser } from "@/providers/auth-provider";
import { useTranslations } from "@/providers/translation-provider";
import { ShowDetails } from "./show";

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

const getShowDetails = async (params: Props["params"]) =>
  await serverToApi<{ tvShow: TvShowDetails }>("show-details", {
    params: { q: (await params).permalink },
    api: "episodate",
  });

export default async function TvShow({ params }: Props) {
  const { permalink } = await params;
  const { userLanguage } = await useTranslations();
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
  return (
    <ShowDetails
      tvShowDetails={showResult.data.tvShow}
      liked={liked ?? false}
      subscribed={subscribed ?? false}
      user={user}
      userLanguage={userLanguage}
      watchedEpisodes={watchedEpisodes}
    />
  );
}

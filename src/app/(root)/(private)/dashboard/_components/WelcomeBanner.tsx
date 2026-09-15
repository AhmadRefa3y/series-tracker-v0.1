import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";
import { redirect } from "next/navigation";

import WelcomeBannerClient from "./WelcomeBannerClient";

/** Same placeholder the old banner used, for users without a profile image. */
const AVATAR_PLACEHOLDER =
  "https://i2.wp.com/walter-r2.trakt.tv/hotlink-ok/placeholders/medium/fry.png?ssl=1";

const WelcomeBanner = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = await prismaDb.user.findUnique({
    where: {
      id: session?.user.id,
    },
  });
  if (!user) {
    redirect("/sign-in");
  }

  // Real stats only, from data the app already tracks. A series counts as
  // "watched" once it has at least one marked episode.
  const [seriesWatched, episodesWatched] = await Promise.all([
    prismaDb.series.count({
      where: { userId: user.id, watchedEpisodes: { some: {} } },
    }),
    prismaDb.watchedEpisode.count({
      where: { userId: user.id },
    }),
  ]);

  return (
    <div className="w-full bg-[#17141a]">
      <WelcomeBannerClient
        userName={user.name}
        memberSince={user.createdAt}
        avatarUrl={user.image || AVATAR_PLACEHOLDER}
        stats={{ seriesWatched, episodesWatched }}
      />
    </div>
  );
};

export default WelcomeBanner;

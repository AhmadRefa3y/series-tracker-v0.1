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
  const [seriesWatched, episodesWatched, weeklyActivity] = await Promise.all([
    prismaDb.series.count({
      where: { userId: user.id, watchedEpisodes: { some: {} } },
    }),
    prismaDb.watchedEpisode.count({
      where: { userId: user.id },
    }),
    prismaDb.watchedEpisode.findMany({
      where: {
        userId: user.id,
        watchedAt: { gte: weekStart() },
      },
      select: { watchedAt: true },
    }),
  ]);

  // Bucket the week's episodes per day (oldest first) for the mini chart.
  const days = [0, 0, 0, 0, 0, 0, 0];
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  for (const episode of weeklyActivity) {
    const daysAgo = Math.floor(
      (endOfToday.getTime() - new Date(episode.watchedAt).getTime()) /
        86_400_000
    );
    if (daysAgo >= 0 && daysAgo < 7) {
      days[6 - daysAgo] += 1;
    }
  }

  return (
    <div className="w-full bg-[#17141a]">
      <WelcomeBannerClient
        userName={user.name}
        memberSince={user.createdAt}
        avatarUrl={user.image || AVATAR_PLACEHOLDER}
        stats={{
          seriesWatched,
          episodesWatched,
          // Estimated from a 40-minute average episode; insights page keeps
          // the exact per-series runtime math.
          minutesWatched: episodesWatched * 40,
          weeklyActivity: days,
        }}
      />
    </div>
  );
};

/** Start of the day 6 days ago (7 calendar-day window including today). */
function weekStart() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  return start;
}

export default WelcomeBanner;

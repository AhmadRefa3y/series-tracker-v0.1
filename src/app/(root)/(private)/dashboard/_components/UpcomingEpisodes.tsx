import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { auth } from "@/auth";

import { getUpcomingEpisodes } from "@/app/(root)/(private)/dashboard/DashbaordData";
import { SectionHeader } from "@/app/(root)/(private)/dashboard/_components/UpNextSkeleton";
import CalendarGrid from "./CalendarGrid";

const UpcomingEpisodes = async () => {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  const { success, data, message } = await getUpcomingEpisodes(30);

  if (!success) {
    return (
      <div className="flex items-center justify-center px-4 py-14 text-white/60">
        <p className="text-lg font-semibold">{message}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    // Nothing scheduled — don't take up dashboard space.
    return null;
  }

  return (
    <section className="mx-4 py-6 pt-8 md:mx-6 md:pt-10">
      <div className="px-4 md:px-6">
        <SectionHeader title="Calendar" loading={false} icon={<CalendarDays className="size-6 shrink-0" strokeWidth={2} />} />
      </div>
      <CalendarGrid items={data} />
    </section>
  );
};

export default UpcomingEpisodes;

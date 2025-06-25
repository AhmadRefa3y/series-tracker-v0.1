import { auth } from "@/auth";
import prismaDb from "@/lib/prisma";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

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
  return (
    <div className="flex flex-col w-full mx-auto bg-gray-900  p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:py-10 items-center sm:justify-between container mx-auto">
        <div className="flex  gap-4 flex-1">
          <div>
            <Image
              src="https://i2.wp.com/walter-r2.trakt.tv/hotlink-ok/placeholders/medium/fry.png?ssl=1"
              alt="User profile"
              width={70}
              height={70}
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col font-semibold">
            <p className="text-2xl">
              Hello,{" "}
              <span className="text-primaryColor">{`${user?.name}`}</span>
            </p>
            <p>Member since {new Date(user?.createdAt).toDateString()}</p>
          </div>
        </div>
        <div className="flex  flex-wrap uppercase text-sm items-center justify-end  flex-1 w-fit text-nowrap sm:gap-8 gap-2 font-semibold ">
          <div className="flex flex-col gap-4  items-end">
            <Link
              href="/"
              className="  hover:bg-primaryColor hover:text-secondaryColor duration-200 rounded-lg pl-2 flex w-fit justify- items-center "
            >
              2025 Year To Date
              <ChevronRight />
            </Link>
            <Link
              href="/"
              className="  hover:bg-primaryColor hover:text-secondaryColor duration-200 rounded-lg pl-2 flex w-fit justify-between items-center "
            >
              apr month in review <ChevronRight />
            </Link>
          </div>
          <div className="flex flex-col gap-4 items-end">
            <Link
              href="/"
              className="  hover:bg-primaryColor hover:text-secondaryColor duration-200 rounded-lg pl-2 flex w-fit justify-between items-center "
            >
              All time stats
              <ChevronRight />
            </Link>
            <Link
              href="/"
              className="  hover:bg-primaryColor hover:text-secondaryColor duration-200 rounded-lg pl-2 flex w-fit justify-between items-center"
            >
              your profile
              <ChevronRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;

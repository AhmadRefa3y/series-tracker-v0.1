import Link from "next/link";
import UserButton from "./userButton";
import Image from "next/image";
import Search from "./Search";
import { auth } from "@/auth";
import MobileNavBar from "./mobileNavBar";

export async function Header() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-[999] w-full bg-black/80 backdrop-blur-sm h-16 text-white ">
      <div className="container flex h-16 items-center justify-between mx-auto ">
        <div className="flex justify-between items-center gap-2 md:gap-4 w-full">
          <MobileNavBar />
          <div className="flex items-center gap-4 z-10">
            <Link href="/" className="flex items-center gap-2">
              <div>
                <Image
                  src="logo.svg"
                  alt="logo"
                  width={200}
                  height={200}
                  className="h-10 w-10 "
                />
              </div>
            </Link>
            <Search />{" "}
          </div>
          <nav className="hidden md:flex items-center gap-6 font-bold">
            <Link
              href="/watchlist"
              className=" hover:text-fuchsia-600 duration-200"
            >
              My Watchlist
            </Link>
            <Link
              href="/shows"
              className=" hover:text-fuchsia-600 duration-200"
            >
              Shows
            </Link>
            <Link
              href="/dashboard"
              className=" hover:text-fuchsia-600 duration-200"
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 z-10">
          <UserButton Session={session} />
        </div>
      </div>
    </header>
  );
}

export default Header;

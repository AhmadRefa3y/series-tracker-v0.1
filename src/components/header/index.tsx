import Link from "next/link";
import UserButton from "./userButton";
import Image from "next/image";
import Search from "./Search";
import { auth } from "@/auth";
import MobileNavBar from "@/components/header/mobileNavBar";

export async function Header() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-[100] w-full bg-black/30 backdrop-blur-sm h-16 text-white px-6">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <div className="flex justify-between items-center gap-2 md:gap-4 w-full">
          <div className="flex items-center gap-4 z-10">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="logo" width={100} height={100} />
            </Link>
            <Search />
          </div>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 font-bold">
            <Link
              href="/watchlist"
              className="font-semibold hover:text-blue-600  duration-200"
            >
              My Watchlist
            </Link>
            <Link
              href="/shows"
              className="font-semibold hover:text-blue-600 duration-200"
            >
              Shows
            </Link>
            <Link
              href="/dashboard"
              className="font-semibold hover:text-blue-600 duration-200"
            >
              Dashboard
            </Link>
          </nav>
          {/* Mobile Burger Menu */}
          <MobileNavBar />
        </div>
        <div className="flex items-center gap-2 z-10">
          <UserButton Session={session} />
        </div>
      </div>
    </header>
  );
}

export default Header;

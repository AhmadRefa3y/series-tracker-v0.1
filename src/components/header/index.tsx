import Link from "next/link";
import Image from "next/image";

import { auth } from "@/auth";
import DesktopNav from "@/components/header/desktopNav";
import MobileNavBar from "@/components/header/mobileNavBar";
import Search from "@/components/header/Search";
import UserButton from "@/components/header/userButton";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-ink-900/70 text-neutralColor shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_18px_40px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 md:gap-6 md:px-6">
        <Link
          href="/"
          aria-label="Sennit home"
          className="flex shrink-0 items-center transition-opacity duration-200 hover:opacity-80"
        >
          <Image
            src="/logo.png"
            alt="Sennit"
            width={100}
            height={100}
            preload
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="flex min-w-0 flex-1 justify-center">
          <Search />
        </div>

        <DesktopNav />

        <div className="flex shrink-0 items-center gap-2">
          <UserButton Session={session} />
          <MobileNavBar />
        </div>
      </div>
    </header>
  );
}

export default Header;

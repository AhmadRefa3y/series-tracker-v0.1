import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";

const MobileNavBar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px] z-[1000]">
        {" "}
        {/* Ensured SheetContent is above header */}
        <nav className="flex flex-col gap-4 pt-4">
          <Link href="/" className="text-lg font-semibold">
            Home
          </Link>
          <Link href="/shows" className="text-lg font-semibold">
            TV Shows
          </Link>
          <Link href="/watchlist" className="text-lg font-semibold">
            My Watchlist
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavBar;

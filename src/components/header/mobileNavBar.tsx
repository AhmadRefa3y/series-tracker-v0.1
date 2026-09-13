"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActivePath } from "./navItems";

const MobileNavBar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          className="flex size-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.03] text-neutralColor transition-colors duration-200 hover:bg-white/10 md:hidden"
        >
          <Menu className="size-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[85%] max-w-xs border-white/10 bg-[#17141a] p-0 text-neutralColor"
      >
        <SheetHeader className="border-b border-white/5 p-5">
          <Image
            src="/logo.png"
            alt="Sennit"
            width={100}
            height={100}
            className="h-9 w-auto object-contain"
          />
          <SheetTitle className="sr-only">Navigation</SheetTitle>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);

            return (
              <SheetClose asChild key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-colors duration-200",
                    active
                      ? "bg-primaryColor text-secondaryColor"
                      : "text-neutralColor/80 hover:bg-white/5 hover:text-neutralColor"
                  )}
                >
                  <Icon className="size-5" strokeWidth={2.25} />
                  {label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavBar;

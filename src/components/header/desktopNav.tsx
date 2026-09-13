"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActivePath } from "./navItems";

const DesktopNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] p-1 md:flex"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200",
              active
                ? "bg-primaryColor text-secondaryColor shadow-sm"
                : "text-neutralColor/70 hover:bg-white/5 hover:text-neutralColor"
            )}
          >
            <Icon className="size-4" strokeWidth={2.25} />
            <span className="sr-only lg:not-sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default DesktopNav;

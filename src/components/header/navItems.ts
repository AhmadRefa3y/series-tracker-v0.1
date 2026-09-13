import {
  BarChart3,
  Bookmark,
  LayoutDashboard,
  Tv,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/shows", label: "Shows", icon: Tv },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

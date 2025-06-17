import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import Link from "next/link";

const MobileNavBar = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="sm:hidden">
        <Menu />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="hover:outline-none  px-0">
          <Link
            href="/watchlist"
            className="font-semibold hover:text-blue-600 duration-200 w-full px-2"
          >
            Watchlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:outline-none px-0">
          <Link
            href="/shows"
            className="font-semibold hover:text-blue-600 duration-200 w-full  px-2"
          >
            Shows
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:outline-none px-0">
          <Link
            href="/dashboard"
            className="font-semibold hover:text-blue-600 duration-200 w-full  px-2"
          >
            Dashboard
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileNavBar;

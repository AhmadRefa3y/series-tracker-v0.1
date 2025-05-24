"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutUser } from "@/lib/actions/userActions";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";

const UserButton = ({ Session }: { Session: Session | null }) => {
  const router = useRouter();
  const firstInitial = Session?.user?.name?.charAt(0).toUpperCase() ?? "";
  if (!Session?.user)
    return (
      <Link href="/sign-in">
        <Button
          variant="ghost"
          className="hover:bg-fuchsia-600/10 hover:text-fuchsia-600 font-semibold transition-colors duration-200"
        >
          Sign In
        </Button>
      </Link>
    );

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-300 hover:bg-fuchsia-600/20 hover:text-fuchsia-600 transition-colors duration-200"
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 z-[1000]" align="end">
          {" "}
          {/* Added z-[1000] here */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {Session.user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {Session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem className="p-0 mb-1">
            <Button
              className="w-full py-4 px-2 h-4 justify-start hover:text-fuchsia-600"
              variant="ghost"
              onClick={async () => {
                await signOutUser();
                router.refresh();
              }}
            >
              Sign Out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { LogOut, UserCircle2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutUser } from "@/lib/actions/userActions";

const UserButton = ({ Session }: { Session: Session | null }) => {
  const router = useRouter();

  const firstInitial = Session?.user?.name?.charAt(0).toUpperCase() ?? "";

  if (!Session?.user) {
    return (
      <Link
        href="/sign-in"
        className="flex items-center gap-2 whitespace-nowrap rounded-full bg-primaryColor px-3 py-2 text-sm font-bold text-secondaryColor shadow-sm transition-transform duration-200 hover:scale-[1.03] sm:px-4"
      >
        <UserCircle2 className="size-5" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 transition duration-200 hover:ring-primaryColor/60"
        >
          {Session.user.image ? (
            <Image
              src={Session.user.image}
              alt={Session.user.name ?? "User avatar"}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-primaryColor">
              {firstInitial}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-xl border border-white/10 bg-[#17141a] p-1.5 text-neutralColor shadow-2xl"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 p-1">
            <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
              {Session.user.image ? (
                <Image
                  src={Session.user.image}
                  alt=""
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-primaryColor">
                  {firstInitial}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-none text-white">
                {Session.user.name}
              </p>
              <p className="mt-1 truncate text-xs leading-none text-white/50">
                {Session.user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-lg px-2 py-2 text-sm font-medium text-neutralColor/80 focus:bg-white/5 focus:text-white"
        >
          <button
            type="button"
            onClick={async () => {
              await signOutUser();
              router.refresh();
            }}
            className="flex w-full items-center gap-2"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;

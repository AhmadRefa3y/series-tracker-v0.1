"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import React from "react";

const OAuthBtns = () => {
  return (
    <div className="flex flex-col gap-3 bg-[#eeeeee] w-full p-4 relative border-b">
      <button
        className="flex items-center justify-center w-full py-2 px-4 bg-white border border-gray-400 rounded-sm shadow-sm hover:bg-gray-50 transition-colors duration-150 font-bold"
        onClick={() => signIn("google")}
        type="button"
      >
        <Image
          src="https://trakt.tv/assets/sites/google-9f305a92f3ce448e215c87d585c5e152909d80d36a75efd450183fa4ee685305.svg"
          alt="Google Logo"
          width={24}
          height={24}
          className="mr-3"
        />
        <span className="text-gray-700 ">Continue with Google</span>
      </button>
      <div className="absolute top-full px-2 rounded-b-sm left-1/2 normal-case text-xs text-gray-500 border border-t-0  -translate-x-1/2 bg-[#eeeeee]">
        or sign in with email
      </div>
    </div>
  );
};

export default OAuthBtns;

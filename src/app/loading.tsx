import { RefreshCcw } from "lucide-react";
import React from "react";

const loading = () => {
  return (
    <div className="flex h-screen  items-center justify-center w-full absolute inset-0  bg-black/60 text-white">
      <RefreshCcw className="animate-spin" size={100} />
    </div>
  );
};

export default loading;

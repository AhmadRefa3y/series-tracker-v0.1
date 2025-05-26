import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

const HomePage = async () => {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }
  return <div>HomePage</div>;
};

export default HomePage;

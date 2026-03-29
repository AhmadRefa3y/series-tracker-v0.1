import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignUpForm from "./credentials-signup-form";
import OAuthBtns from "@/app/(auth)/sign-in/oAuthBtns";

export const metadata: Metadata = {
  title: "Sign Up",
};

const SignUp = async (props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) => {
  const searchParams = await props.searchParams;

  const { callbackUrl } = searchParams;

  const session = await auth();

  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-foreground relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
      <div className="w-full max-w-xs pt-10  space-y-8  rounded-lg shadow-xl bg-card z-10 relative">
        <div className="text-center">
          <Link
            href="/"
            className="inline-block absolute left-1/2 -translate-x-1/2 -top-10 "
          >
            <Image
              src="/logo.png"
              alt="Sennit Logo"
              width={100}
              height={100}
              className="mx-auto bg-black rounded-full "
              priority
            />
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-card-foreground">
            Create Account
          </h1>
          <OAuthBtns signUp={true} />
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;

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
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-[#f5f5f7] text-foreground relative">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://trakt.tv/assets/auth/breaking-bad-blur-756cc8baa3074a86282cb2672af547c20a1e529b191542c4c02a72c121209486.jpg.webp"
          alt="Dramatic landscape with silhouettes"
          fill
          className="bg-transparent"
        />
      </div>
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

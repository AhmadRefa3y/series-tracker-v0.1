import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignUpForm from "./credentials-signin-form";

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
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-background text-foreground">
      <div className="w-full max-w-md p-8 space-y-8 md:p-10 rounded-lg shadow-xl bg-card">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="https://trakt.tv/assets/logos/logomark.square.gradient-b644b16c38ff775861b4b1f58c1230f6a097a2466ab33ae00445a505c33fcb91.svg"
              alt="TV Time Logo"
              width={70}
              height={70}
              className="mx-auto"
              priority
            />
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-card-foreground">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your information below to create your account
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
// Card components are no longer needed
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import CredentialsSignInForm from "./credentials-signin-form";

export const metadata: Metadata = {
  title: "Sign In",
};

const SignIn = async (props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) => {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();

  if (session) {
    return redirect(callbackUrl || "/");
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-background text-foreground">
      <div className="w-full max-w-md p-8 space-y-8 md:p-10 rounded-lg shadow-xl bg-card">
        {" "}
        {/* Optional: add a subtle background to the form area if desired, or remove bg-card for a flatter look */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="https://trakt.tv/assets/logos/logomark.square.gradient-b644b16c38ff775861b4b1f58c1230f6a097a2466ab33ae00445a505c33fcb91.svg"
              alt="TV Time Logo"
              width={70} // Adjusted size for a cleaner look
              height={70}
              className="mx-auto"
              priority
            />
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-card-foreground">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back! Please enter your details.
          </p>
        </div>
        <CredentialsSignInForm />
        {/* The "Don't have an account? Sign Up" link is part of CredentialsSignInForm */}
      </div>
    </div>
  );
};

export default SignIn;

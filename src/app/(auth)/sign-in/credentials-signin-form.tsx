"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { signInDefaultValues } from "@/lib/constants";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCredentials } from "@/lib/actions/userActions";
import { signInDefaultValues } from "@/lib/constants";
import { ArrowRight, Lock, Mail } from "lucide-react";

const CredentialsSignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [error, setError] = useState<string | null>(null);

  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
        variant="default"
      >
        {pending ? "Signing In..." : "Sign In"}
      </Button>
    );
  };

  const signInGet = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await signInWithCredentials(formData);

      if (result.error) {
        setError(result.message);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={signInGet}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6 px-5 border-b pb-5">
        {error && <p className="">{error}</p>}

        <div className="flex flex-col">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail className="w-5 h-5" aria-hidden="true" />
            </span>
            <Input
              id="email"
              name="email"
              placeholder="Email"
              required
              type="email"
              defaultValue={signInDefaultValues.email}
              autoComplete="email"
              className="pl-10 rounded-none border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow h-12 group-focus-within:border-blue-500 group-focus-within:ring-2 group-focus-within:ring-blue-400 focus:shadow-[0_0_0_1px_#3b82f6,0_0_6px_2px_#3b82f6] shadow-none"
            />
          </div>
          <div className="relative group mt-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </span>
            <Input
              id="password"
              name="password"
              placeholder="Password"
              required
              type="password"
              defaultValue={signInDefaultValues.password}
              autoComplete="password"
              className="pl-10 rounded-none border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow h-12 group-focus-within:border-blue-500 group-focus-within:ring-2 group-focus-within:ring-blue-400 focus:shadow-[0_0_0_2px_#3b82f6,0_0_12px_4px_#3b82f6] shadow-[0_0_0_0_rgba(59,130,246,0.7),0_0_8px_2px_rgba(59,130,246,0.5)]"
            />
          </div>
        </div>
        <div>
          <SignInButton />
        </div>
      </div>
      <div className="text-sm text-center text-muted-foreground py-4 font-extrabold">
        New to Sennit?{" "}
        <Link
          target="_self"
          className="link text-blue-400 font-bold hover:underline hover:text-blue-500"
          href="/sign-up"
        >
          Join now
          <ArrowRight className="inline ml-1 w-4 h-4" />
        </Link>
      </div>
    </form>
  );
};

export default CredentialsSignInForm;

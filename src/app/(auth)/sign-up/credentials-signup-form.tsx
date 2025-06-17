"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/actions/userActions";
import { signUpDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Mail, Lock, User } from "lucide-react";

const SignUpForm = () => {
  const [data, action] = useActionState(signUp, {
    message: "",
    success: false,
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const SignUpButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
        variant="default"
      >
        {pending ? "Signing Up..." : "Sign Up"}
      </Button>
    );
  };

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6 px-5 border-b pb-5">
        {!data.success && data.message && (
          <div className="text-center text-destructive">{data.message}</div>
        )}

        <div className="flex flex-col gap-2">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <User className="w-5 h-5" aria-hidden="true" />
            </span>
            <Input
              id="name"
              name="name"
              placeholder="Name"
              required
              type="text"
              defaultValue={signUpDefaultValues.name}
              autoComplete="name"
              className="pl-10 rounded-none border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow h-12 group-focus-within:border-blue-500 group-focus-within:ring-2 group-focus-within:ring-blue-400 focus:shadow-[0_0_0_1px_#3b82f6,0_0_6px_2px_#3b82f6] shadow-none"
            />
          </div>
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
              defaultValue={signUpDefaultValues.email}
              autoComplete="email"
              className="pl-10 rounded-none border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow h-12 group-focus-within:border-blue-500 group-focus-within:ring-2 group-focus-within:ring-blue-400 focus:shadow-[0_0_0_1px_#3b82f6,0_0_6px_2px_#3b82f6] shadow-none"
            />
          </div>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </span>
            <Input
              id="password"
              name="password"
              placeholder="Password"
              required
              type="password"
              defaultValue={signUpDefaultValues.password}
              autoComplete="new-password"
              className="pl-10 rounded-none border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow h-12 group-focus-within:border-blue-500 group-focus-within:ring-2 group-focus-within:ring-blue-400 focus:shadow-[0_0_0_1px_#3b82f6,0_0_6px_2px_#3b82f6] shadow-none"
            />
          </div>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </span>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              type="password"
              defaultValue={signUpDefaultValues.confirmPassword}
              autoComplete="new-password"
              className="pl-10 rounded-none border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow h-12 group-focus-within:border-blue-500 group-focus-within:ring-2 group-focus-within:ring-blue-400 focus:shadow-[0_0_0_1px_#3b82f6,0_0_6px_2px_#3b82f6] shadow-none"
            />
          </div>
        </div>
        <div>
          <SignUpButton />
        </div>
      </div>
      <div className="text-sm text-center text-muted-foreground py-4 font-extrabold">
        Already have an account?{" "}
        <Link
          target="_self"
          className="link text-blue-400 font-bold hover:underline hover:text-blue-500"
          href={`/sign-in?callbackUrl=${callbackUrl}`}
        >
          Sign In
          <ArrowRight className="inline ml-1 w-4 h-4" />
        </Link>
      </div>
    </form>
  );
};

export default SignUpForm;

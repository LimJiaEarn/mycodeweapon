"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Logo from "@/components/utils/Logo"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SignInPage() {
  return (
    <div className="w-full min-h-screen grid grid-cols-1">
      <Form />
    </div>
  );
}

function Form() {

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSigningUp(true);

    console.log("submitted form", e.currentTarget);
    setTimeout(()=>{setIsSigningUp(false)}, 2000)

  }

  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);

  return (
    <div className="bg-background">
      <div className="flex items-center w-full justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div>
            <div className="flex">
              <Logo withText logoSize={40}/>
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-black dark:text-white">
              Sign In
            </h2>
          </div>

          <div className="mt-10">
            <div>
              <form onSubmit={onSubmit} className="space-y-6">

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-md">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="codegod@gmail.com"
                    type="text"
                    required
                    disabled={isSigningUp}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="font-semibold text-md">
                    Password
                  </Label>
                  <Input
                    id="password"
                    placeholder="••••••••••••"
                    type="password"
                    required
                    disabled={isSigningUp}
                  />
                </div>

                <div className="w-full flex_col_center gap-1">
                  <Button
                    type="submit"
                    className="px-4 py-2 rounded-xl w-[300px]"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? "Creating account..." : "Create account"}
                  </Button>
                  <p className={cn("text-sm text-neutral-600 text-center mt-4 dark:text-neutral-400")}>
                    Do not have an account?{" "}
                    <Link href="/signup" className="text-black dark:text-white">
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* <div className="mt-10">
              <p className="text-neutral-600 dark:text-neutral-400 text-sm text-center mt-8">
                By clicking on sign up, you agree to our{" "}
                <Link href="/terms-of-service" className="text-neutral-500 dark:text-neutral-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacypolicy" className="text-neutral-500 dark:text-neutral-300">
                  Privacy Policy
                </Link>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { toast } from "sonner";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="relative w-full max-w-md">
      {/* Beige Card */}
      <div className="relative border border-[#1c1c1c]/10 bg-[#f7f4f0] p-8 shadow-xl">
        <div className="relative space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="font-gloock text-3xl text-[#1c1c1c]">
              Welcome Back
            </h1>
            <p className="text-sm text-[#5c5c5c]">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium uppercase tracking-widest text-[#1c1c1c]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border-[#1c1c1c]/20 bg-[#f2efe9] text-[#1c1c1c] placeholder:text-[#5c5c5c]/50 focus:border-[#1c1c1c] focus:ring-0"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium uppercase tracking-widest text-[#1c1c1c]">
                  Password
                </Label>
                <Link
                  href="/auth/forget-password"
                  className="text-xs text-[#5c5c5c] transition-colors hover:text-[#1c1c1c] uppercase tracking-widest"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#1c1c1c]/20 bg-[#f2efe9] text-[#1c1c1c] placeholder:text-[#5c5c5c]/50 focus:border-[#1c1c1c] focus:ring-0"
                suppressHydrationWarning
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                onClick={() => setRememberMe(!rememberMe)}
                className="border-[#1c1c1c]/40 data-[state=checked]:bg-[#1c1c1c] data-[state=checked]:border-[#1c1c1c]"
              />
              <Label htmlFor="remember" className="text-sm text-[#5c5c5c]">
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full border border-[#1c1c1c] bg-[#1c1c1c] text-[#f2efe9] shadow-lg font-medium uppercase tracking-widest transition-all hover:bg-transparent hover:text-[#1c1c1c]"
              suppressHydrationWarning
              disabled={loading}
              onClick={async () => {
                await signIn.email(
                  {
                    email,
                    password,
                  },
                  {
                    onRequest: () => setLoading(true),
                    onResponse: () => setLoading(false),
                    onError: (ctx) => {
                      if (ctx.error.status === 403) {
                        toast.error(
                          "Please verify your email address before signing in"
                        );                        setTimeout(() => {
                          window.location.href = "/auth/verify-email";
                        }, 1500);                      } else {
                        toast.error(ctx.error.message || "Failed to sign in");
                      }
                    },
                    onSuccess: () => {
                      toast.success("Signed in successfully");
                      window.location.href = "/";
                    },
                  }
                );
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#1c1c1c]/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-[#f7f4f0] px-2 text-[#5c5c5c]">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-[#1c1c1c]/20 bg-transparent text-[#1c1c1c] transition-colors hover:border-[#1c1c1c] hover:bg-[#e8e5df]"
                disabled={loading}
                onClick={async () => {
                  await signIn.social(
                    {
                      provider: "google",
                      callbackURL: "/",
                    },
                    {
                      onRequest: () => setLoading(true),
                      onResponse: () => setLoading(false),
                    }
                  );
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 256 262"
                  className="mr-2"
                >
                  <path
                    fill="#4285F4"
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                  ></path>
                  <path
                    fill="#EB4335"
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                  ></path>
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="border-[#1c1c1c]/20 bg-transparent text-[#1c1c1c] transition-colors hover:border-[#1c1c1c] hover:bg-[#e8e5df]"
                disabled={loading}
                onClick={async () => {
                  await signIn.social(
                    {
                      provider: "github",
                      callbackURL: "/",
                    },
                    {
                      onRequest: () => setLoading(true),
                      onResponse: () => setLoading(false),
                    }
                  );
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="mr-2"
                >
                  <path
                    fill="currentColor"
                    d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                  ></path>
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center text-sm text-[#5c5c5c]">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="font-medium text-[#1c1c1c] transition-colors hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

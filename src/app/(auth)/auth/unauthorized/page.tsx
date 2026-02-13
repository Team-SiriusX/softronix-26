"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client"; // your Better Auth client

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    authClient.signOut(); // sign out immediately

    const timer = setTimeout(() => {
      router.push("/");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-950 text-white px-4">
      <div className="text-center">
        <ShieldAlert
          size={64}
          className="mx-auto mb-6 text-blue-500 animate-bounce drop-shadow-lg"
        />
        <h1 className="text-4xl font-extrabold mb-2 tracking-wide text-blue-400">
          Access Denied
        </h1>
        <p className="text-lg mb-6 max-w-md mx-auto text-gray-300">
          You are not authorized to view this page.
          <br />
          Redirecting to the home screen...
        </p>
        <div className="text-sm text-blue-300 italic">
          Logging you out for security purposes.
        </div>
      </div>
    </div>
  );
}
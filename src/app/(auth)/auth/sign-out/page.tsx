"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SignOut() {
	const router = useRouter();

	useEffect(() => {
		const handleSignOut = async () => {
			try {
				await authClient.signOut({
					fetchOptions: {
						onSuccess: () => {
							router.push("/auth/sign-in");
						},
						onError: (ctx) => {
							console.error("Sign out error:", ctx.error);
							// Still redirect even on error
							router.push("/auth/sign-in");
						},
					},
				});
			} catch (error) {
				console.error("Sign out exception:", error);
				router.push("/auth/sign-in");
			}
		};

		handleSignOut();
	}, [router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-800 bg-black/40 p-8 backdrop-blur-xl">
				<Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
				<p className="text-neutral-300">Signing out...</p>
			</div>
		</div>
	);
}
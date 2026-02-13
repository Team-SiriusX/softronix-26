"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ForgetPassword() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!email) {
			toast.error("Please enter your email address");
			return;
		}

		setLoading(true);

		try {
			console.log("🔄 Requesting password reset for:", email);
			
			const result = await authClient.requestPasswordReset({
				email,
				redirectTo: "/auth/reset-password",
			});

			console.log("📬 Password reset response:", result);

			if (result.error) {
				console.error("❌ Password reset error:", result.error);
				toast.error(result.error.message || "Failed to send reset email");
				setLoading(false);
				return;
			}
			
			console.log("✅ Password reset email sent successfully");
			setEmailSent(true);
			toast.success("Password reset link sent to your email");
		} catch (error) {
			console.error("❌ Password reset exception:", error);
			toast.error((error as Error)?.message || "Failed to send reset email. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (emailSent) {
		return (
			<div className="w-full max-w-md">
				<div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
					<div className="flex flex-col items-center text-center">
						<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
							<Mail className="h-8 w-8 text-white" />
						</div>
						<h2 className="mb-2 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-2xl font-bold text-transparent">
							Check your email
						</h2>
						<p className="mb-6 text-sm text-neutral-400">
							We&apos;ve sent a password reset link to <strong className="text-neutral-300">{email}</strong>
						</p>
						<p className="mb-6 text-sm text-neutral-500">
							Didn&apos;t receive the email? Check your spam folder or try again.
						</p>
						
						<div className="flex w-full flex-col gap-3">
							<Button
								variant="outline"
								onClick={() => {
									setEmailSent(false);
									setEmail("");
								}}
								className="w-full border-neutral-700 bg-neutral-900/50 text-neutral-300 transition-colors hover:bg-neutral-800/50 hover:text-white"
							>
								Try another email
							</Button>
							<Link href="/auth/sign-in" className="w-full">
								<Button variant="ghost" className="w-full gap-2 border border-neutral-700 bg-transparent text-neutral-300 transition-colors hover:bg-neutral-800/50 hover:text-white">
									<ArrowLeft className="h-4 w-4" />
									Back to sign in
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md">
			<div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
				{/* Header */}
				<div className="mb-6">
					<h2 className="mb-2 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-2xl font-bold text-transparent">
						Forgot Password?
					</h2>
					<p className="text-sm text-neutral-400">
						Enter your email address and we&apos;ll send you a link to reset your password
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleResetPassword} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email" className="text-neutral-300">
							Email
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
							className="border-neutral-700 bg-neutral-900/50 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>

					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
						disabled={loading}
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending...
							</>
						) : (
							"Send reset link"
						)}
					</Button>

					<Link href="/auth/sign-in" className="block w-full">
						<Button
							variant="ghost"
							className="w-full gap-2 border border-neutral-700 bg-transparent text-neutral-300 transition-colors hover:bg-neutral-800/50 hover:text-white"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to sign in
						</Button>
					</Link>
				</form>
			</div>
		</div>
	);
}

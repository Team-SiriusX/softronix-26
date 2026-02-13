"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, Suspense } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

function ResetPasswordContent() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const error = searchParams.get("error");

	useEffect(() => {
		// Check for error in URL (invalid/expired token)
		if (error === "INVALID_TOKEN" || error === "invalid_token") {
			toast.error("Invalid or expired reset link");
		} else if (!token) {
			toast.error("No reset token provided");
		}
	}, [token, error]);

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!token) {
			toast.error("Invalid reset link");
			return;
		}

		if (!password || !confirmPassword) {
			toast.error("Please fill in all fields");
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			toast.error("Password must be at least 8 characters long");
			return;
		}

		setLoading(true);

		try {
			const { error: resetError } = await authClient.resetPassword({
				newPassword: password,
				token: token,
			});

			if (resetError) {
				toast.error(resetError.message || "Failed to reset password");
				setLoading(false);
				return;
			}

			setSuccess(true);
			toast.success("Password reset successfully!");
			
			setTimeout(() => {
				router.push("/auth/sign-in");
			}, 2000);
		} catch (err) {
			toast.error((err as Error)?.message || "Failed to reset password. Please try again.");
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="w-full max-w-md">
				<div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
					<div className="flex flex-col items-center text-center">
						<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
							<CheckCircle2 className="h-8 w-8 text-white" />
						</div>
						<h2 className="mb-2 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-2xl font-bold text-transparent">
							Password Reset Successful
						</h2>
						<p className="text-sm text-neutral-400">
							Your password has been successfully reset. Redirecting to sign in...
						</p>
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
						Reset Password
					</h2>
					<p className="text-sm text-neutral-400">
						Enter your new password below
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleResetPassword} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="password" className="text-neutral-300">
							New Password
						</Label>
						<Input
							id="password"
							type="password"
							placeholder="Enter new password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
							minLength={8}
							className="border-neutral-700 bg-neutral-900/50 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword" className="text-neutral-300">
							Confirm Password
						</Label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="Confirm new password"
							required
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={loading}
							minLength={8}
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
								Resetting...
							</>
						) : (
							"Reset Password"
						)}
					</Button>

					<Link href="/auth/sign-in" className="block w-full">
						<Button
							variant="ghost"
							className="w-full border border-neutral-700 bg-transparent text-neutral-300 transition-colors hover:bg-neutral-800/50 hover:text-white"
							type="button"
						>
							Back to sign in
						</Button>
					</Link>
				</form>
			</div>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen w-full items-center justify-center p-4">
				<div className="w-full max-w-md space-y-8">
					<div className="flex items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
					</div>
				</div>
			</div>
		}>
			<ResetPasswordContent />
		</Suspense>
	);
}
